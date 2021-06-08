express = require('express')
router = express.Router()

const {isSocio} = require('../isAuth.js')
const {crearTokenAcceso, enviarTokenAcceso} = require('../tokens.js')

router.use((req, res, next) => {
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
)

router.get('/', (req, res) => {
    res.render("socio")
})

router.get('/tienda',(req, res) => {
    res.send("Norabuena, llegaste a la tienda")
})

module.exports = router