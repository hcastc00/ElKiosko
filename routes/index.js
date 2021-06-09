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

// router.get('/login', (req,  res) => {
//
//     res.render('registro')
// })

router.post('/login',  (req, res) => {
    require('../DBHandler.js').login(req.body.usuario, req.body.contrasenya)
        .then(function (result) {
            if (result !== "null") {

                const tokenacceso = crearTokenAcceso({'nombre': result['nombre'], 'tipo': result['tipo']})

                //Revisar
                // require('../DBHandler.js').guardar_tokenrefresco(tokenrefresco, req.body.usuario)
                //     .then(function (result) {
                //     }).catch(function (error) {
                //     console.log(error)
                // });

                enviarTokenAcceso(req, res, tokenacceso, result.tipo)
                res.send({tipo: result.tipo})

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