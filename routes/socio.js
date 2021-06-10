express = require('express')
router = express.Router()

const fs = require('fs')
const { isSocio } = require('../isAuth.js')
const { crearTokenAcceso, enviarTokenAcceso } = require('../tokens.js')

router.use((req, res, next) => {
    try {
        let token = isSocio(req)
        //Refresco el token para ampliar el tiempo
        req.cookies.token_acceso = crearTokenAcceso(token.usuario.nombre, token.usuario.tipo)
        req.nombre = token.usuario.nombre
        next()
    } catch (e) {
        if (e.message === 'No tienes los permisos') {
            //Seria redirigir a vista de usuario
            res.redirect('/admin')
        } else if (e.name === 'TokenExpiredError') {
            res.redirect('/?err=caducado#loginForm')
        } else if (e.message === 'Necesitas iniciar sesion') {
            res.redirect('/?error=noSesion#loginForm')
        }
    }
}
)

router.get('/', (req, res) => {
    let saldoUsuario;
    let nombre = req.nombre;
    require('../DBHandler.js').getSaldo(nombre)
        .then(function (result) {
            saldoUsuario = result.saldo;
            res.render("socio", { nombre: nombre, saldo: saldoUsuario })
        })
        .catch(function(err){
            console.log(err)
        })
})

router.get('/tienda', (req, res) => {

    let nombre = req.nombre;
    let saldoUsuario;
    require('../DBHandler.js').getSaldo(nombre)
        .then(function (result) {
            saldoUsuario = result.saldo;
            //Obtengo de la base de datos una lista con las colecciones que tienen cromos para comprar
            require('../DBHandler.js').getColeccionesActivas()
                .then(function (result) {
                    let portadas = getPortadasColecciones(result)
                    console.log(result)
                    res.render('coleccion', {portadas: portadas, colecciones: result, usuario: nombre, saldo: saldoUsuario})
                })

                .catch(function (err) {
                    console.log('Se ha producido un error en la query', err)
                })
        })

        .catch(function (err) {
            console.log(err)
        })
})

function getPortadasColecciones(colecciones){
    let path;
    let portadas;
    colecciones.forEach(coleccion => {
        path = 'public/cromos/'+coleccion.nombre
        fs.readdir(path, function(err, list){
            if (err){
                console.log(err);
            } else{
                console.log(list[0])
                portadas.append(list[0])
            }
        })
    });

    return portadas
}

router.get('/tiendaCromos', (req, res) => {

    let coleccion = req.query.coleccion;
    let usuario = req.nombre;
    let saldoUsuario;
    require('../DBHandler.js').getSaldo(usuario)
        .then(function (result) {
            saldoUsuario = result.saldo;
            require('../DBHandler.js').getCromosAlaVenta(coleccion)
            .then(function(result){
                console.log(result)
                res.render("tienda", {usuario: usuario, saldo:saldoUsuario, coleccion: coleccion, cromos: result})
            })

            .catch(function(err){
                console.log(err)
            })
        .catch(function(err){
            console.log(err)
        })
    })
})

router.get('/juegos', (req, res) => {
    res.render("tetris")
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
    //const token = req.cookies.token_acceso;
    //const usuario = jwt.decode(token, process.env.TOKEN_SECRET).usuario.nombre;

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