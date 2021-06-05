express = require('express')
router = express.Router()

const {isAuth} = require('../isAuth.js')

router.get('/*', (req, res) => {
    try {
        const usuario = isAuth(req)
        if (usuario !== null) {
            res.render("admin")
        } else {
            res.redirect('/#loginForm')
        }
    } catch (e) {
        console.log(e)
    }

})

router.get('/crearColeccion', (req, res) => {
    res.redirect('/#loginForm')
})

module.exports = router