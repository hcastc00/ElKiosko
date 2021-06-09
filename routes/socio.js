express = require('express')
router = express.Router()

const { isSocio } = require('../isAuth.js')
const { crearTokenAcceso, enviarTokenAcceso } = require('../tokens.js')

/*router.use((req, res, next) => {
        try {
            let token = isSocio(req)
            enviarTokenAcceso(req, res, crearTokenAcceso(token.usuario, token.tipo))
            next()
        }catch (e) {
            if (e.message === 'No tienes los permisos') {
                //Seria redirigir a vista de usuario
                res.redirect('/admin')
            }else if(e.name === 'TokenExpiredError'){
                res.redirect('/?err=caducado#loginForm')
            }else if(e.message === 'Necesitas iniciar sesion'){
                res.redirect('/?error=noSesion#loginForm')
            }
        }
    }
)*/

router.get('/', (req, res) => {
    res.render("socio")
})

router.get('/tienda', (req, res) => {
    res.send("Norabuena, llegaste a la tienda")
})



router.post('/comprarCromo', (req, res) => {
    const cromo = req.body.cromo;
    const cromoID = cromo.id;
    const rutaCromo = cromo.ruta;
    const precioCromo = -cromo.precio;
    const coleccion = cromo.coleccion;
    const usuario = 'bayon';
    let album;
    //TODO Descomentar esto para que se coja el usuario del token
    //const token = req.cookies.token_acceso;
    //const usuario = jwt.decode(token, process.env.TOKEN_SECRET).usuario.nombre;



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
                            res.send(err)
                        })



                })

                .catch(function (err) {
                    console.log('El socio NO TIENE SALDO SUFICIENTE para comprar el cromo');
                    res.status(500)
                    res.send('El socio NO TIENE SALDO SUFICIENTE para comprar el cromo')
                })
        })

        .catch(function(err){
            console.log(err)
            res.status(500)
            res.send('El socio NO TIENE el album correspondiente a la coleccion de ese cromo')
        })

});



router.post('/comprarAlbum', (req, res) => {

    const album = req.body.album;
    const albumID = album.id;
    const precioAlbum = -album.precio;
    const usuario = 'bayon';
    //TODO Descomentar esto para que se coja el usuario del token
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
                    res.send(err)
                })
        })

        .catch(function (err) {
            console.log('NO tiene saldo suficiente para el album')
            res.status(500)
            res.send(err)
        })

})



module.exports = router