const {verify} = require('jsonwebtoken')

const isAuth = req => {

    const token = req.cookies['token_acceso']
    if (!token) throw new Error('Necesitas iniciar sesion')

    const usuario  = verify(token, process.env.TOKEN_SECRET)
    return usuario
}

const isAdmin = usuario => {

    return usuario.tipo
}

module.exports = {
    isAuth,
    isAdmin
}