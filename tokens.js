const jwt = require('jsonwebtoken');

const crearTokenAcceso = (usuario, tipo) => {
    return jwt.sign({'usuario': usuario, 'tipo': tipo}, process.env.TOKEN_SECRET, {
        expiresIn: '30m'
    })
}

const enviarTokenAcceso = (req, res, tokenacceso) => {
    res.cookie('token_acceso', tokenacceso, {
        httpOnly: true
    })
}

module.exports = {
    crearTokenAcceso,
    enviarTokenAcceso,
}