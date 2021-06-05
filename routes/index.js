express = require('express')
router = express.Router()

const {
    crearTokenAcceso,
    crearTokenRefresco,
    enviarTokenAcceso,
    enviarTokenRefresco
} = require('../tokens.js')

router.get('/', (require,  res) => {
    res.render('index')
})

router.get('/registro', (require,  res) => {
    res.render('registro')
})

// router.get('/login', (req,  res) => {
//
//     res.render('registro')
// })

router.post('/login', (req,  res) => {
    require('../DBHandler.js').login(req.body.usuario, req.body.contrasenya)
        .then(function (result) {
            if (result != "null") {
                const tokenacceso = crearTokenAcceso({ 'nombre': result['nombre'], 'tipo': result['tipo'] })
                const tokenrefresco = crearTokenAcceso({ 'nombre': result['nombre'], 'tipo': result['tipo'] })

                //TODO: pushear a la db el token de refresco

                enviarTokenRefresco(res, tokenrefresco)
                enviarTokenAcceso(req, res, tokenacceso)

            }
        })
        .catch(function (error) {
            console.log(error)
        })
})

router.post('/logout', (req, res) => {
    res.clearCookie('tokenrefresco')
    res.redirect('/')
})

module.exports = router