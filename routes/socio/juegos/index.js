express = require('express')
router = express.Router()

const db = require('../../../DBHandler.js')


router.get('/tetris', (req, res) => {
    let saldoUsuario;
    let nombre = req.nombre;
    db.getSaldo(nombre)
        .then(function (result) {
            saldoUsuario = result.saldo;
            res.render("socio/tetris", { usuario: nombre, saldo: saldoUsuario })
        })
        .catch(function (err) {
            console.log(err)
        })
})

router.post('/tetris', (req, res) => {

    let monedas = Math.floor(req.body.score/300);
    let username = req.nombre;
    db.modificaSaldo(username, monedas)
    res.send({monedas : monedas});
})

router.get('/breakout', (req, res) => {
    let saldoUsuario;
    let nombre = req.nombre;
    db.getSaldo(nombre)
        .then(function (result) {
            saldoUsuario = result.saldo;
            res.render("socio/breakout", { usuario: nombre, saldo: saldoUsuario })
        })
        .catch(function (err) {
            console.log(err)
        })
})

router.post('/breakout', (req, res) => {
    let monedas = req.body.score;
    let nombre = req.nombre;
    db.modificaSaldo(nombre,monedas)
    res.send({monedas : monedas});
})

module.exports = router