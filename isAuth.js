const {verify, decode} = require('jsonwebtoken')

const isAuth = req => {

    const token = req.cookies['token_acceso']
    if (!token) throw new Error("Necesitas iniciar sesion")

    const token_valido  = verify(token, process.env.TOKEN_SECRET)
    return token_valido
}

const isAdmin = req => {

    const token = req.cookies['token_acceso']
    if (!token) throw new Error("Necesitas iniciar sesion")

    const es_admin  = decode(token, process.env.TOKEN_SECRET)['tipo'] === 'admin'
    return es_admin
}

module.exports = {
    isAuth,
    isAdmin
}