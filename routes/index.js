express = require('express')
router = express.Router()

//Constantes para encriptar con bcrypt
const bcrypt = require('bcrypt');
const saltRounds = 10;

const {
    crearTokenAcceso,
    enviarTokenAcceso,
} = require('../tokens.js')

router.get('/', (req, res) => {
    if (req.cookies['token_acceso'] !== undefined){
        res.redirect('/socio')
    }else {
        res.render('index', {error: req.query.err})
    }
})

router.get('/registro',  (req, res) => {
    res.render('registro')
})

router.post('/registro', registrar_usuario)
function registrar_usuario(req, res) {

    bcrypt.hash(req.body.contrasenya, saltRounds, function (err, hash) {

        require('../DBHandler.js').registrar_usuario(req.body.usuario, hash, req.body.tipo)
            .then(function () {
                const tokenacceso = crearTokenAcceso({'nombre': req.body.usuario, 'tipo': req.body.tipo})
                enviarTokenAcceso(req, res, tokenacceso)

                res.send({'tipo': req.body.tipo})
            })
            .catch(function (error) {
                if (error['code'] === 'ER_DUP_ENTRY') {
                    // Error de que la primary key este duplicada
                    res.send({ error: 'duplicado' })
                } else {
                    console.log(error)
                }
            });
    })
}


router.post('/login',  (req, res) => {
    require('../DBHandler.js').login(req.body.usuario, req.body.contrasenya)
        .then(function (result) {
            if (result !== "null") {

                const tokenacceso = crearTokenAcceso({'nombre': result.nombre, 'tipo': result.tipo})
                enviarTokenAcceso(req, res, tokenacceso)

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