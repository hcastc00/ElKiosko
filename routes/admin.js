express = require('express')
router = express.Router()

const {isAuth, isAdmin} = require('../isAuth.js')

router.get('/', (req, res) => {

    try {
        isAuth(req)
        if (isAdmin) {
            res.render("admin")
        } else {
            res.redirect('/registro')
        }
    }catch (e) {

        //Si el error tiene este nombre, significa que el toquen esta expirado
        if(e.name === 'TokenExpiredError'){
            res.redirect('/#loginForm')
        }
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