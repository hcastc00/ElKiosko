express = require('express')
router = express.Router()

router.get('/',(require,  res) => {
    res.render("admin")
})

router.get('/crearColeccion',(require,  res) => {
    res.redirect('/#loginForm')
})

module.exports = router