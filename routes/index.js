const {verify} = require("jsonwebtoken");
express = require('express')
router = express.Router()

const {
    crearTokenAcceso,
    crearTokenRefresco,
    enviarTokenAcceso,
    enviarTokenRefresco
} = require('../tokens.js')

const {isAuth} = require('./isAuth.js');

router.get('/', (require, res) => {
    res.render('index')
})

router.get('/registro', (require, res) => {
    res.render('registro')
})

// router.get('/login', (req,  res) => {
//
//     res.render('registro')
// })

router.post('/login', (req, res) => {
    require('../DBHandler.js').login(req.body.usuario, req.body.contrasenya)
        .then(function (result) {
            if (result != "null") {
                const tokenacceso = crearTokenAcceso({'nombre': result['nombre'], 'tipo': result['tipo']})
                const tokenrefresco = crearTokenRefresco({'nombre': result['nombre'], 'tipo': result['tipo']})

                //Revisar
                require('../DBHandler.js').importar_tokenrefresco(tokenrefresco)
                    .then(function (result) {
                    }).catch(function (error) {
                    console.log(error)
                });

                enviarTokenAcceso(req, res, tokenacceso)
                enviarTokenRefresco(res, tokenrefresco)

            }
        })
        .catch(function (error) {
            console.log(error)
        })
})


router.post('/logout', (req, res) => {
    res.clearCookie('tokenrefresco', {path: '/refrescar_token'})
    res.redirect('/')
})

//Para ver como se hace la autentiacacion del usuario
router.post('/protected', async (req, res) => {
    try {
        const userID = isAuth(req);
        if (userID !== null) {
            res.send({
                data: 'Esto son datos protegidos'
            })
        }
    } catch (err) {
        res.send({
            //El error será, "Necesitas iniciar sesion", error que es lanzado por isAuth
            error: err.message
        })
    }
})

//Dar un nuevo token de acceso, con un token de refresco

router.post("/refrescar_token", (req, res) => {

    //el token refresco lo manda el cliente cuando toque, ahora aparece como sin definir
    const token = req.cookies.tokenrefresco;
    if (!token) return res.send({accestoken: ''})
    let payload = null;
    try {
        payload = verify(token, process.env.TOKEN_SECRET)
    } catch (err) {
        return res.send({
            accestoken: ''
        })
    }

    //El token es valido, ahora pasamos a comprobar si el usuario existe
    let user = null;

    require('../DBHandler.js').get_usuario()
        .then(function (result) {
            user = result
        }).catch(function (error) {
        console.log(error)
    });

    if (user == null){
        return res.send({
            accestoken: ''
        })
    }

    //Si el usuario existe, comprobar que existe su token de refresco

    //El token de refresco no existe en el usuario
    if (user.tokenrefresco !== token){
        return res.send({
            accestoken: ''
        })
    }

    //EL token de refresco si existe, creamos un nuevo token de refresco y otro de acceso
    const tokenacceso = crearTokenAcceso({'nombre': user.nombre, 'tipo': user.tipo})
    const tokenrefresco = crearTokenRefresco({'nombre': user.nombre, 'tipo': user.tipo})

    //Actualizar el token de refresco en la base de datos
    require('../DBHandler.js').importar_tokenrefresco(tokenrefresco)
        .then(function (result) {
        }).catch(function (error) {
        console.log(error)
    });

    //Enviar nuestros nuevos token, de acceso y de refresco

    enviarTokenAcceso(tokenacceso);
    enviarTokenRefresco(tokenrefresco);






})


module.exports = router