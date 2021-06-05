express = require('express')
router = express.Router()

router.get('/', (require,  res) => {
    res.render('index')
})

router.get('/registro', (require,  res) => {
    res.render('registro')
})

module.exports = router