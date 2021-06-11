express = require('express')
router = express.Router()

const fs = require('fs')
const { isSocio } = require('../isAuth.js')
const { crearTokenAcceso, enviarTokenAcceso } = require('../tokens.js')


router.use((req, res, next) => {
    try {
        let token = isSocio(req)

        //Refresco el token para ampliar el tiempo
        let nuevoToken = crearTokenAcceso({'nombre': token.usuario.nombre, 'tipo': token.usuario.tipo})
        enviarTokenAcceso(req, res, nuevoToken)

        req.nombre = token.usuario.nombre
        next()
    } catch (e) {
        if (e.message === 'No tienes los permisos') {
            res.redirect('/admin')
        } else if (e.name === 'TokenExpiredError') {
            res.clearCookie('token_acceso')
            res.redirect('/?error=caducado')
        } else if (e.message === 'Necesitas iniciar sesion') {
            res.redirect('/?error=noSesion')
        }else {
            res.redirect('/')
        }
    }
})


router.get('/', (req, res) => {
    let saldoUsuario;
    let nombre = req.nombre;
    require('../DBHandler.js').getSaldo(nombre)
        .then(function (result) {
            saldoUsuario = result.saldo;
            res.render("socio", { nombre: nombre, saldo: saldoUsuario })
        })
        .catch(function (err) {
            console.log(err)
        })
})

router.get('/tienda', (req, res) => {

    let nombre = req.nombre;
    let saldoUsuario;
    let portadas;
    require('../DBHandler.js').getSaldo(nombre)
        .then(function (result) {
            saldoUsuario = result.saldo;
            //Obtengo de la base de datos una lista con las colecciones que tienen cromos para comprar
            require('../DBHandler.js').getColeccionesActivas()
                .then(function (result) {
                    portadas = getPortadasColecciones(result)
                    console.log(result)
                    res.render('coleccion', { portadas: portadas, colecciones: result, usuario: nombre, saldo: saldoUsuario })
                })

                .catch(function (err) {
                    console.log('Se ha producido un error en la query', err)
                })
        })

        .catch(function (err) {
            console.log(err)
        })
})

function getPortadasColecciones(colecciones) {
    let path;
    let portadas = new Array();
    let fotos;
    colecciones.forEach(coleccion => {
        path = 'public/cromos/' + coleccion.nombre
        fotos = fs.readdirSync(path, { withFileTypes: true });
        portadas.push(fotos[0].name)
    });
    return portadas;
}

router.get('/tiendaCromos', (req, res) => {

    let coleccion = req.query.coleccion;
    let usuario = req.nombre;
    let saldoUsuario;
    require('../DBHandler.js').getSaldo(usuario)
        .then(function (result) {
            saldoUsuario = result.saldo;
            require('../DBHandler.js').getCromosAlaVenta(coleccion)
                .then(function (result) {
                    console.log(result)
                    res.render("tienda", { usuario: usuario, saldo: saldoUsuario, coleccion: coleccion, cromos: result })
                })

                .catch(function (err) {
                    console.log(err)
                })
                .catch(function (err) {
                    console.log(err)
                })
        })
})

router.get('/inventario', (req, res) => {
    res.render("inventario")
})

router.get('/juegos/tetris', (req, res) => {
    let saldoUsuario;
    let nombre = req.nombre;
    require('../DBHandler.js').getSaldo(nombre)
        .then(function (result) {
            saldoUsuario = result.saldo;
            res.render("tetris", { usuario: nombre, saldo: saldoUsuario })
        })
        .catch(function (err) {
            console.log(err)
        })
})

router.post('/juegos/tetris', (req, res) => {

    let monedas = Math.floor(req.body.score/1000);
    let username = req.nombre;
    console.log("probando"+monedas)
    require('../DBHandler.js').modificaSaldo(username, monedas)
        .then(function (result) {
            res.send(monedas);
        })
        .catch(function (err) {
            console.log('Se ha producido un error', err);
            res.status(500);
            res.send(err);
        })
})

router.get('/juegos/breakout', (req, res) => {
    let saldoUsuario;
    let nombre = req.nombre;
    require('../DBHandler.js').getSaldo(nombre)
        .then(function (result) {
            saldoUsuario = result.saldo;
            res.render("breakout", { usuario: nombre, saldo: saldoUsuario })
        })
        .catch(function (err) {
            console.log(err)
        })
})

router.post('/juegos/breakout', (req, res) => {

    let monedas = req.body.score;
    let username = req.nombre;
    require('../DBHandler.js').modificaSaldo(username, monedas)
        .then(function (result) {
            res.send(monedas);
        })
        .catch(function (err) {
            console.log('Se ha producido un error', err);
            res.status(500);
            res.send(err);
        })

})


router.post('/comprarCromo', (req, res) => {
    const cromo = req.body.cromo;
    const cromoID = cromo.id;
    const rutaCromo = cromo.ruta;
    const precioCromo = -cromo.precio;
    const coleccion = cromo.coleccion;
    let album;
    const usuario = req.nombre;



    require('../DBHandler.js').getAlbum(usuario, coleccion)

        .then(function (result) {
            album = result
            require('../DBHandler.js').tieneDineroParaCromo(cromoID, usuario)
                .then(function (result) {
                    console.log('Se puede comprar el cromo sin problema')

                    require('../DBHandler.js').tieneCromoEnAlbum(rutaCromo, album)
                        .then(function (result) {
                            require('../DBHandler.js').venderCromo(cromoID, usuario)
                                .then(function (result) {
                                    console.log('El cromo se ha comprado de manera satisfactoria')
                                    require('../DBHandler.js').modificaSaldo(usuario, precioCromo)
                                    res.sendStatus(200);
                                })

                                .catch(function (err) {
                                    console.log('Se ha producido un error', err)
                                    res.status(500)
                                    res.send(err)
                                })
                        })

                        .catch(function (err) {
                            console.log(err)
                            res.status(500)
                            res.send("Ya_Comprado")
                        })



                })

                .catch(function (err) {
                    console.log('El socio NO TIENE SALDO SUFICIENTE para comprar el cromo');
                    res.status(500)
                    res.send('Sin_Saldo')
                })
        })

        .catch(function (err) {
            console.log(err)
            res.status(500)
            res.send('Sin_Album')
        })

});



router.post('/comprarAlbum', (req, res) => {

    const album = req.body.album;
    const albumID = album.id;
    const precioAlbum = -album.precio;
    const usuario = req.nombre;

    //Primero se comprueba si tiene el saldo necesario para comprarlo y si tiene se compra
    require('../DBHandler.js').tieneDineroParaAlbum(usuario, albumID)
        .then(function (result) {
            require('../DBHandler.js').venderAlbum(usuario, albumID)
                .then(function (result) {
                    console.log('El album se ha vendido de manera satisfactoria')
                    require('../DBHandler.js').modificaSaldo(usuario, precioAlbum)
                    res.sendStatus(200)
                })

                .catch(function (err) {
                    console.log('Se ha producido un error:', err)
                    res.status(500)
                    res.send('Ya_Comprado')
                })
        })

        .catch(function (err) {
            console.log('NO tiene saldo suficiente para el album')
            res.status(500)
            res.send('Sin_Saldo')
        })

})



module.exports = router