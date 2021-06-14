express = require('express')
router = express.Router()

const fs = require('fs')
const {isAdmin} = require('../isAuth.js')
const {crearTokenAcceso, enviarTokenAcceso} = require('../tokens.js')
const multer = require("multer");


//Storage con multer
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "tmp");

    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

var upload = multer({storage: storage});

router.use((req, res, next) => {
        try {
            let token = isAdmin(req)

            //Refresco el token para ampliar el tiempo
            let nuevoToken = crearTokenAcceso({'nombre': token.usuario.nombre, 'tipo': token.usuario.tipo})
            enviarTokenAcceso(req, res, nuevoToken)

            req.nombre = token.usuario.nombre
            next()
        } catch (e) {
            if (e.message === 'No tienes los permisos') {
                res.redirect('/socio')
            } else if (e.name === 'TokenExpiredError') {
                res.clearCookie('token_acceso')
                res.redirect('/?error=caducado')
            } else if (e.message === 'Necesitas iniciar sesion') {
                res.redirect('/?error=noSesion')
            }
        }
    }
)

router.get('/', (req, res) => {

    res.render("admin", {nombre: req.nombre})
})

router.get('/crearColeccion', (req, res) => {
    res.render('crearColeccion')
})

router.get('/modificaColeccion', (req, res) => {
    let coleccion = req.query.nombreColeccion;
    let dir = 'public/cromos/' + coleccion;
    let leidos = fs.readdirSync(dir, {withFileTypes: true});
    let archivos = new Array();
    let nombre = req.nombre;
    leidos.forEach(leido => {
        archivos.push(leido.name)
    })
    /*fs.readdirSync(dir, (err, archivos) => {
        if (err) {
            console.log(err);
            return;
        }
    });*/
    console.log(archivos);
    res.render('cromos', {nombreColeccion: coleccion, fotos: archivos, nombre: nombre});
})


router.post("/upload_things", upload.array("files"), uploadThings);

function uploadThings(req, res) {
    let coleccion = req.body.name;
    if (moverAColeccion(coleccion) == 1) {
        res.send(200);
    } else {
        res.sendStatus(500);
        //send('El nombre de coleccion introducido ya esta utilizado')
    }

}


router.post("/upload_cromos", uploadCromos);

function uploadCromos(req, res) {

    let album;
    let usuario = req.nombre;
    let coleccion = req.body.nombreColeccion;
    let cromoJSON = req.body.cromosJSON;
    require('../DBHandler.js').getAlbum(usuario, coleccion)
        .then(function (id) {
            album = id;
            for (let i = 0; i < cromoJSON.length; i++) {
                require('../DBHandler.js').insertarCromo(cromoJSON[i].nombre, cromoJSON[i].ruta, cromoJSON[i].precio, album, coleccion)
                    .then(function (result) {
                        if (cromoJSON[i].cantidad > 1) {
                            require('../DBHandler.js').duplicarCromo(cromoJSON[i].ruta, album, coleccion, cromoJSON[i].cantidad)
                                .then(function (result) {
                                }).catch(function (err) {
                                console.log(err);
                            });
                        } else {
                        }
                    }).catch(function (err) {
                    console.log(err);
                });
            };

            //Revisar esto que falla aquí
            res.redirect("/?coleccionCreada=true");
        })
        .catch(function (err) {
            console.log(err);
        });
}

router.post("/crear_album", crearAlbum);

function crearAlbum(req, res) {
    let coleccion = req.body.nombreColeccion;
    let usuario = req.nombre
    let estado = 'finalizada'
    require('../DBHandler.js').insertarAlbum(usuario, coleccion, estado)
        .then(function (result) {
            res.sendStatus(200);
        });
}

router.post('/crear_coleccion', crearColeccion);

function crearColeccion(req, res) {
    let nombre = req.body.nombreColeccion;
    let precioAlbum = req.body.precio;
    let estado = 'activa';
    require('../DBHandler.js').insertarColeccion(nombre, precioAlbum, estado)
}

router.get('/colecciones_creadas', (req, res) => {

    let nombre = req.nombre;
    let albumes = [];
    let numeroCromosColeccion = [];
    let numeroCromosAlbum;
    let portadas

    require('../DBHandler.js').getAlbumesUsuario(nombre)
        .then(function (result) {
            albumes = result;

            portadas = getPortadasColecciones(albumes)

            albumes.forEach(function (album, index) {

                let coleccion = album.nombre;
                let path = 'public/cromos/' + coleccion;
                numeroCromosColeccion.push(fs.readdirSync(path));

                numeroCromosAlbum = result;
                res.render("inventario_admin", {nombre: nombre, portadas: portadas, albumes: albumes})

            })
        })
        .catch(function (err) {
            res.send('No hay colecciones')
        })
})

router.get('/inventarioCromos', (req, res) => {
    let coleccion = req.query.coleccion;
    let usuario = req.nombre;

    require('../DBHandler.js').getAlbum(usuario, coleccion)
        .then(function (result) {
            let album = result
            require('../DBHandler.js').getCromosColeccion(coleccion)
                .then(function (result) {
                    console.log(result.length);
                    res.render("inventarioCromos_admin", {
                        usuario: usuario,
                        coleccion: coleccion,
                        cromos: result,
                        album: album
                    })
                })
                .catch(function (err) {
                    console.log(err)
                })
        })
        .catch(function (err) {
            res.status(500)
            res.send(err)
        })
})

router.post('/inventarioCromos', (req, res) => {

    if (req.body.copias >= 1) {
        require('../DBHandler.js').duplicarCromo(req.body.ruta, req.body.album, req.body.coleccion, req.body.copias)
            .then((result) => {
                require('../DBHandler.js').setEstadoColeccion('activa', req.body.coleccion)
                res.end()
            })
            .catch((error) => {
                console.log(error)
                res.send({error: error})
            })
    } else {
        res.send({error: 'CopiasErroneas'})
    }
})

function moverAColeccion(coleccion) {
    let newDir = 'public/cromos/' + coleccion;
    if (!fs.existsSync(newDir)) {
        fs.mkdirSync(newDir);

        fs.readdir('tmp', function (err, list) {
            if (err) return done(err);
            let old = '';
            let newPath = '';
            for (let i = 0; i < list.length; i++) {
                old = 'tmp/' + list[i];
                newPath = newDir + '/' + list[i];
                fs.rename(old, newPath, function (err) {
                    if (err) throw err;
                });
            }
        });
        return 1;
    } else {
        //Borro las imagenes del directorio temporal y aviso del error
        fsPro.readdir('tmp/')
            .then(files => {
                const unlinkPromises = files.map(file => {
                    const filePath = path.join('tmp/', file)
                    return fsPro.unlink(filePath)
                })

                return Promise.all(unlinkPromises)
            }).catch(err => {
            console.error(`Something wrong happened removing files of tmp/`)
        })

        return -1;
    }
}

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

module.exports = router