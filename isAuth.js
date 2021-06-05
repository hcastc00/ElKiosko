const {verify} = require('jsonwebtoken')

const isAuth = req => {
    const autorizacion = req.header['authorization']
    if (!autorizacion) throw new Error("Necesitas iniciar sesion")

    // 'Bearer uioyagsfiuyagsfoyagsdfuy'
    const token = autorizacion.split(' ')[1]
    const userId  = verify(token, process.env.TOKEN_SECRET)
    return userId
}

module.exports = {
    isAuth,
}