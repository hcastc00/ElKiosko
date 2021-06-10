express = require('express')
router = express.Router()

const {isAdmin} = require('../isAuth.js')
const {crearTokenAcceso, enviarTokenAcceso} = require('../tokens.js')

router.use((req, res, next) => {
        try {
            let token = isAdmin(req)
            //Refresco el token para ampliar el tiempo
            req.cookies.token_acceso = crearTokenAcceso(token.usuario.nombre, token.usuario.tipo)
            req.nombre = token.usuario.nombre
            next()
        } catch (e) {
            if (e.message === 'No tienes los permisos') {
                //Seria redirigir a vista de usuario
                res.redirect('/socio')
            } else if (e.name === 'TokenExpiredError') {
                res.redirect('/?err=caducado#loginForm')
            } else if (e.message === 'Necesitas iniciar sesion') {
                res.redirect('/?error=noSesion#loginForm')
            }
        }
    }
)

router.get('/', (req, res) => {
    res.render("admin", {nombre: req.nombre})
})

router.get('/crearColeccion', (req, res) => {
    res.redirect('/#loginForm')
})

module.exports = router