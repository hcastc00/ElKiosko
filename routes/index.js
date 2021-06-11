express = require('express')
router = express.Router()

const {
    crearTokenAcceso,
    enviarTokenAcceso,
} = require('../tokens.js')

router.get('/', (req, res) => {
    res.render('index', {error: req.query.err})
})

router.get('/registro',  (req, res) => {
    res.render('registro')
})

router.post('/login',  (req, res) => {
    require('../DBHandler.js').login(req.body.usuario, req.body.contrasenya)
        .then(function (result) {
            if (result !== "null") {

                const tokenacceso = crearTokenAcceso({'nombre': result.nombre, 'tipo': result.tipo})

                enviarTokenAcceso(req, res, tokenacceso
                )
                res.send({tipo: result.tipo})
            }else{
                res.send({error: 'combinacionErronea'})
            }

        })
        .catch(function (error) {
            console.log(error)
        })
})


router.all('/logout',  (req, res) => {
    res.clearCookie('token_acceso')
    res.redirect('/')
})

module.exports = router