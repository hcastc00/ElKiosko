const {verify} = require('jsonwebtoken')

const isAuth = req => {

    const token = req.cookies['token_acceso']
    if (!token) throw new Error('Necesitas iniciar sesion')

    const token_decodificado = verify(token, process.env.TOKEN_SECRET)
    return token_decodificado

}

const isAdmin = req => {
    let token = isAuth(req)

    if (token.usuario.tipo !== 'admin') throw new Error('No tienes los permisos')
    return token
}

const isSocio = req => {
    let token = isAuth(req)

    if (token.usuario.tipo !== 'socio') throw new Error('No tienes los permisos')
    return token
}

module.exports = {
    isAuth,
    isAdmin,
    isSocio
}