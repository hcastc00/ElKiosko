const jwt = require('jsonwebtoken');

const crearTokenAcceso = (usuario, tipo) => {
    return jwt.sign({'usuario': usuario, 'tipo': tipo}, process.env.TOKEN_SECRET, {
        expiresIn: '30m'
    })
}

const crearTokenRefresco = (usuario, tipo) => {
    return jwt.sign({'usuario': usuario, 'tipo': tipo}, process.env.TOKEN_SECRET, {
        expiresIn: '7d'
    })
}

const enviarTokenAcceso = (req, res, tokenacceso) => {
    res.send({
        tokenacceso,
        usuario: req.body.usuario,
    })
}

const enviarTokenRefresco = (res, tokenrefresco) => {
    res.cookie('tokenrefresco', tokenrefresco, {
        httpOnly: true,
        path: 'refrescar_token'
    })
}

module.exports = {
    crearTokenAcceso,
    crearTokenRefresco,
    enviarTokenAcceso,
    enviarTokenRefresco
}
/*
function authenticarToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        console.log(err)

        if (err) return res.sendStatus(403)

        req.user = user

        next()
    })
}

 */