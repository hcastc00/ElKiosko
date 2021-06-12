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

    //TODO comprobar que la tienda tiene colecciones activas otra vez, por si es el último cromo vendido. Sino sacar un toast que te diga que ya no está disponible y redireccionar
    require('../DBHandler.js').getSaldo(usuario)
        .then(function (result) {
            saldoUsuario = result.saldo;
            require('../DBHandler.js').getCromosAlaVenta(coleccion)
                .then(function (result) {
                    console.log( result.length);
                    res.render("tienda", { usuario: usuario, saldo: saldoUsuario, coleccion: coleccion, cromos: result })
                })
                .catch(function (err) {
                    console.log(err)
                })
        })
})

router.get('/inventario', (req, res) => {

    let nombre = req.nombre;
    let saldoUsuario;
    let albumes = [];
    let numeroCromosColeccion = [];
    let numeroCromosAlbum;
    let portadas
    require('../DBHandler.js').getSaldo(nombre)
        .then(function (result) {
            saldoUsuario = result.saldo;
            require('../DBHandler.js').getAlbumesUsuario(nombre)
                .then(function (result) {
                    albumes = result;

                    portadas = getPortadasColecciones(albumes)

                    albumes.forEach(function(album, index){

                        let coleccion = album.nombre;
                        let path = 'public/cromos/' + coleccion;
                        numeroCromosColeccion.push(fs.readdirSync(path));
                        require('../DBHandler.js').getNumeroCromosAlbum(nombre, coleccion)
                            .then(function (result) {
                                numeroCromosAlbum = result;
                                album.estado = estadoAlbum(numeroCromosColeccion.length, numeroCromosAlbum)
                                res.render("inventario", { nombre: nombre, saldo: saldoUsuario, portadas: portadas, albumes: albumes})
                            })

                            .catch(function (err) {
                                console.log(err)
                            })

                    })
                })
                .catch(function (err) {
                    console.log(err)
                })
        })
        .catch(function (err) {
            console.log(err)
        })


})

router.get('/inventarioCromos', (req, res) => {

    let coleccion = req.query.coleccion;
    let usuario = req.nombre;
    let saldoUsuario, album;

    require('../DBHandler.js').getAlbum(usuario, coleccion)
        .then(function(result){
            album = result
            require('../DBHandler.js').getSaldo(usuario)
            .then(function (result) {
                saldoUsuario = result.saldo;
                require('../DBHandler.js').getCromosAlbum(album)
                    .then(function (result) {
                        console.log( result.length);
                        res.render("inventarioCromos", { usuario: usuario, saldo: saldoUsuario, coleccion: coleccion, cromos: result })
                    })
                    .catch(function (err) {
                        console.log(err)
                    })
            })
        })

        .catch(function(err){
            res.status(500)
            res.send(err)
        })
})



function estadoAlbum(numeroCromosColeccion, numeroCromosAlbum){
    if (numeroCromosAlbum == numeroCromosColeccion){
        return 'Finalizado';
    }else if(numeroCromosAlbum == 0){
        return 'No iniciado';
    }else{
        return 'Completado parcialmente'
    }

}

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
    require('../DBHandler.js').modificaSaldo(username, monedas)
    res.send({monedas : monedas});
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
    let nombre = req.nombre;
    require('../DBHandler.js').modificaSaldo(nombre,monedas)
    res.send({monedas : monedas});
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

                                    //TODO Esto no acaba de ir, pero creo que está fino filipino y quedá na de ná
                                    let estado = estadoColeccion(coleccion)
                                    if(estado === 'agotada'){
                                        require('../DBHandler.js').setEstadoColeccion(estado, coleccion)
                                        res.send({agotada: estado})
                                    }
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

function estadoColeccion(coleccion){

    let estado;
    require('../DBHandler.js').getCromosAlaVenta(coleccion)
        .then(function (result) {
            estado = result.length;
            if (estado == 0){
                return 'agotada';
            }else {
                return 'activa';
            }
        })
        .catch(function (err) {
            console.log(err)
        })


}


module.exports = router