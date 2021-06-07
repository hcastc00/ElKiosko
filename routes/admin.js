express = require('express')
router = express.Router()

const {isAuth} = require('../isAuth.js')

router.get('/', (req, res) => {

        const usuario = isAuth(req)
        if (usuario !== null) {
            res.render("admin")
        } else {
            res.redirect('/#loginForm')
        }

})

router.get('/autenticar',(req, res, next) => {
    //if not isAuth res.redirect('/#loginForm')
})


router.get('/tienda', isAuth, (req, res) =>{

    res.send("Norabuena, llegaste a la tienda")
})

router.get('/crearColeccion', (req, res) => {
    res.redirect('/#loginForm')
})

module.exports = router