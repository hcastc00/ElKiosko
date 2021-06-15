express = require('express')
router = express.Router()

const fs = require('fs')
const db = require('../../DBHandler.js')
const {isSocio} = require('../../isAuth.js')
const {crearTokenAcceso, enviarTokenAcceso} = require('../../tokens.js')


router.use((req, res, next) => {
    try {
        let token = isSocio(req)

        //Refresco el token para ampliar el tiempo
        let nuevoToken = crearTokenAcceso({'nombre': token.usuario.nombre, 'tipo': token.usuario.tipo})
        enviarTokenAcceso(req, res, nuevoToken)

        req.nombre = token.usuario.nombre
        next()
    } catch (e) {
        if (e.message === 'No tienes los permisos') {
            res.redirect('/admin')
        } else if (e.name === 'TokenExpiredError') {
            res.clearCookie('token_acceso')
            res.redirect('/?error=caducado')
        } else if (e.message === 'Necesitas iniciar sesion') {
            res.redirect('/?error=noSesion')
        } else {
            res.redirect('/')
        }
    }
})


router.get('/', (req, res) => {
    let saldoUsuario;
    let nombre = req.nombre;
    db.getSaldo(nombre)
        .then(function (result) {
            saldoUsuario = result.saldo;
            res.render("socio/index", {nombre: nombre, saldo: saldoUsuario})
        })
        .catch(function (err) {
            console.log(err)
        })
})

router.get('/tienda', (req, res) => {

    let nombre = req.nombre;
    let saldoUsuario;
    let portadas;
    db.getSaldo(nombre)
        .then(function (result) {
            saldoUsuario = result.saldo;
            //Obtengo de la base de datos una lista con las colecciones que tienen cromos para comprar
            db.getColeccionesActivas()
                .then(function (result) {
                    portadas = getPortadasColecciones(result)
                    console.log(result)
                    res.render('socio/tienda_albumes', {
                        portadas: portadas,
                        colecciones: result,
                        usuario: nombre,
                        saldo: saldoUsuario
                    })
                })

                .catch(function (err) {
                    console.log('Se ha producido un error en la query', err)
                })
        })
        .catch(function (err) {
            console.log(err)
        })
})

router.get('/tiendaCromos', (req, res) => {

    let coleccion = req.query.coleccion;
    let usuario = req.nombre;
    let saldoUsuario;

    db.getSaldo(usuario)
        .then(function (result) {
            saldoUsuario = result.saldo;
            db.getCromosAlaVenta(coleccion)
                .then(function (result) {
                    console.log(result.length);
                    res.render("socio/tienda_cromos", {
                        usuario: usuario,
                        saldo: saldoUsuario,
                        coleccion: coleccion,
                        cromos: result
                    })
                })
                .catch(function (err) {
                    console.log(err)
                })
        })
})

router.get('/inventario', (req, res) => {

    let nombre = req.nombre;
    let saldoUsuario;
    let albumes = [];
    let numeroCromosColeccion = [];
    let numeroCromosAlbum;
    let portadas
    db.getSaldo(nombre)
        .then(function (result) {
            saldoUsuario = result.saldo;
            db.getAlbumesUsuario(nombre)
                .then(function (result) {
                    albumes = result;

                    portadas = getPortadasColecciones(albumes)

                    albumes.forEach(function (album, index) {

                        let coleccion = album.nombre;                                    
                        db.getNumeroCromosAlbum(nombre, coleccion)
                            .then(function (result) {
                                numeroCromosAlbum = result.num; 
                                let path = 'public/cromos/' + coleccion;
                                numeroCromosColeccion = fs.readdirSync(path);
                                album.estado = estadoAlbum(numeroCromosColeccion.length, numeroCromosAlbum)
                                db.setEstadoAlbum(album.estado, album.id)
                                    .then(function (result) {
                                        if (index === albumes.length - 1) {
                                            res.render("socio/inventario_albumes", {
                                                nombre: nombre,
                                                saldo: saldoUsuario,
                                                portadas: portadas,
                                                albumes: albumes
                                            })
                                        }
                                    })

                            })

                            .catch(function (err) {
                                console.log(err)
                            })
                    })
                })
                .catch(function (err) {
                    console.log(err)
                })
        })
        .catch(function (err) {
            console.log(err)
        })


})

router.get('/inventarioCromos', (req, res) => {

    let coleccion = req.query.coleccion;
    let usuario = req.nombre;
    let saldoUsuario, album;

    db.getAlbum(usuario, coleccion)
        .then(function (result) {
            album = result
            db.getSaldo(usuario)
                .then(function (result) {
                    saldoUsuario = result.saldo;
                    db.getCromosAlbum(album)
                        .then(function (result) {
                            res.render("socio/inventario_cromos", {
                                usuario: usuario,
                                saldo: saldoUsuario,
                                coleccion: coleccion,
                                cromos: result
                            })
                        })
                        .catch(function (err) {
                            console.log(err)
                        })
                })
        })

        .catch(function (err) {
            res.status(500)
            res.send(err)
        })
})

router.post('/comprarCromo', (req, res) => {
    const cromo = req.body.cromo;
    const cromoID = cromo.id;
    const rutaCromo = cromo.ruta;
    const precioCromo = -cromo.precio;
    const coleccion = cromo.coleccion;
    let album;
    const usuario = req.nombre;


    db.getAlbum(usuario, coleccion)

        .then(function (result) {
            album = result
            db.tieneDineroParaCromo(cromoID, usuario)
                .then(function (result) {

                    db.tieneCromoEnAlbum(rutaCromo, album)
                        .then(function (result) {
                            db.venderCromo(cromoID, album)
                                .then(function (result) {
                                    db.modificaSaldo(usuario, precioCromo)
                                    db.getCromosAlaVenta(coleccion)
                                        .then(function (result) {
                                            let estado = estadoColeccion(coleccion, result)
                                            if (estado === 'agotada') {
                                                db.setEstadoColeccion(estado, coleccion)
                                                res.send({agotada: estado})
                                            }
                                            res.sendStatus(200);
                                        }).catch(function (err) {
                                        console.log('Se ha producido un error', err)
                                        res.status(500)
                                        res.send(err)
                                    });
                                })

                                .catch(function (err) {
                                    console.log('Se ha producido un error', err)
                                    res.status(500)
                                    res.send(err)
                                })
                        })

                        .catch(function (err) {
                            console.log(err)
                            res.status(500)
                            res.send("Ya_Comprado")
                        })


                })

                .catch(function (err) {
                    console.log('El socio NO TIENE SALDO SUFICIENTE para comprar el cromo');
                    res.status(500)
                    res.send('Sin_Saldo')
                })
        })

        .catch(function (err) {
            console.log(err)
            res.status(500)
            res.send('Sin_Album')
        })

});


router.post('/comprarAlbum', (req, res) => {

    const album = req.body.album;
    const albumID = album.id;
    const precioAlbum = -album.precio;
    const usuario = req.nombre;

    //Primero se comprueba si tiene el saldo necesario para comprarlo y si tiene se compra
    db.tieneDineroParaAlbum(usuario, albumID)
        .then(function (result) {
            db.venderAlbum(usuario, albumID)
                .then(function (result) {
                    console.log('El album se ha vendido de manera satisfactoria')
                    db.modificaSaldo(usuario, precioAlbum)
                    res.sendStatus(200)
                })

                .catch(function (err) {
                    console.log('Se ha producido un error:', err)
                    res.status(500)
                    res.send('Ya_Comprado')
                })
        })

        .catch(function (err) {
            console.log('NO tiene saldo suficiente para el album')
            res.status(500)
            res.send('Sin_Saldo')
        })

})

function getPortadasColecciones(colecciones) {
    let path;
    let portadas = new Array();
    let fotos;
    colecciones.forEach(coleccion => {
        path = 'public/cromos/' + coleccion.nombre
        fotos = fs.readdirSync(path, {withFileTypes: true});
        portadas.push(fotos[0].name)
    });
    return portadas;
}

function estadoAlbum(numeroCromosColeccion, numeroCromosAlbum) {
    if (numeroCromosAlbum == numeroCromosColeccion) {
        return 'Finalizado';
    } else if (numeroCromosAlbum == 0) {
        return 'No iniciado';
    } else {
        return 'Completado parcialmente'
    }

}

function estadoColeccion(coleccion, result) {

    let cantidadCromos;
    let estado;
    cantidadCromos = result.length;
    if (cantidadCromos == 0) {
        estado = 'agotada';
    } else {
        estado = 'activa';
    }
    return estado;

}


module.exports = router