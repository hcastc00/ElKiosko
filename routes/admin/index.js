express = require('express')
router = express.Router()

const fs = require('fs')
const db = require('../../DBHandler.js')
const { isAdmin } = require('../../isAuth.js')
const { crearTokenAcceso, enviarTokenAcceso } = require('../../tokens.js')
const multer = require("multer");
const fsPro = fs.promises;
const path = require("path");


//Storage con multer
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "tmp");

    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

var upload = multer({ storage: storage });

router.use((req, res, next) => {
    try {
        let token = isAdmin(req)

        //Refresco el token para ampliar el tiempo
        let nuevoToken = crearTokenAcceso({ 'nombre': token.usuario.nombre, 'tipo': token.usuario.tipo })
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

    res.render("admin/", { nombre: req.nombre })
})

router.get('/crearColeccion', (req, res) => {
    res.render('admin/subir_cromos')
})

router.get('/modificaColeccion', (req, res) => {
    let coleccion = req.query.nombreColeccion;
    let dir = 'public/cromos/' + coleccion;
    let leidos = fs.readdirSync(dir, { withFileTypes: true });
    let archivos = new Array();
    let nombre = req.nombre;
    leidos.forEach(leido => {
        archivos.push(leido.name)
    })

    res.render('admin/crear_cromos', { nombreColeccion: coleccion, fotos: archivos, nombre: nombre });
})


router.post("/upload_things", upload.array("files"), uploadThings);

function uploadThings(req, res) {
    let coleccion = req.body.name;
    if (moverAColeccion(coleccion) == 1) {
        res.send(200);
    } else {
        //Responde con estado 500 cuando el nombre del directorio existe en el proyecto
        res.sendStatus(500);
    }

}


router.post("/upload_cromos", uploadCromos);

function uploadCromos(req, res) {

    let album;
    let usuario = req.nombre;
    let coleccion = req.body.nombreColeccion;
    let cromoJSON = req.body.cromosJSON;
    db.getAlbum(usuario, coleccion)
        .then(function (id) {
            album = id
            for (let i = 0; i < cromoJSON.length; i++) {
                db.insertarCromo(cromoJSON[i].nombre, cromoJSON[i].ruta, cromoJSON[i].precio, album, coleccion)
                    .then(function (result) {
                        if (cromoJSON[i].cantidad > 1) {
                            db.duplicarCromo(cromoJSON[i].ruta, album, coleccion, (cromoJSON[i].cantidad - 1))
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
            let path = "/?coleccionCreada=true"
            res.send({ ruta: path });
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
    db.insertarAlbum(usuario, coleccion, estado)
        .then(function (result) {
            res.sendStatus(200);
        });
}

router.post('/crear_coleccion', crearColeccion);

function crearColeccion(req, res) {
    let nombre = req.body.nombreColeccion;
    let precioAlbum = req.body.precio;
    let estado = 'activa';
    db.insertarColeccion(nombre, precioAlbum, estado)
}

router.get('/colecciones_creadas', (req, res) => {

    let nombre = req.nombre;
    let albumes = [];
    let numeroCromosColeccion = [];
    let numeroCromosAlbum;
    let portadas

    db.getAlbumesUsuario(nombre)
        .then(function (result) {
            albumes = result;

            portadas = getPortadasColecciones(albumes)

            albumes.forEach(function (album, index) {

                let coleccion = album.nombre;
                let path = 'public/cromos/' + coleccion;
                numeroCromosColeccion.push(fs.readdirSync(path));

                numeroCromosAlbum = result;
                res.render("admin/inventario_albumes", { nombre: nombre, portadas: portadas, albumes: albumes })

            })
        })
        .catch(function (err) {
            res.send('No hay colecciones')
        })
})

router.get('/inventarioCromos', (req, res) => {
    let coleccion = req.query.coleccion;
    let usuario = req.nombre;
    let listareps;

    db.getAlbum(usuario, coleccion)
        .then(function (result) {
            let album = result

            db.getNumCromosAlaVenta(coleccion)
                .then(function (result) {
                    listareps = result;
                    db.getCromosColeccion(coleccion)
                        .then(function (result) {

                            result.forEach(elem =>{
                                if(!listareps.some(item => item.ruta_imagen == elem.ruta_imagen)){
                                    elem.repeticiones = 0;                              
                                }
                            })
                            res.render("admin/inventario_cromos", {
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

                })

        })
        .catch(function (err) {
            res.status(500)
            res.send(err)
        })
})

router.post('/inventarioCromos', (req, res) => {

    if (req.body.copias >= 1) {
        db.duplicarCromo(req.body.ruta, req.body.album, req.body.coleccion, req.body.copias)
            .then((result) => {
                db.setEstadoColeccion('activa', req.body.coleccion)
                res.end()
            })
            .catch((error) => {
                console.log(error)
                res.send({ error: error })
            })
    } else {
        res.send({ error: 'CopiasErroneas' })
    }
})

function moverAColeccion(coleccion) {
    let newDir = 'public/cromos/' + coleccion;
    if (!fs.existsSync(newDir)) {
        fs.mkdirSync(newDir);

        let fotos = fs.readdirSync('tmp');

        fotos.forEach(foto => {
            let old = 'tmp/' + foto;
            let newPath = newDir + '/' + foto;
            fs.renameSync(old, newPath);

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
                console.error('Ya existe coleccion con ese nombre')
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
        fotos = fs.readdirSync(path, { withFileTypes: true });
        portadas.push(fotos[0].name)
    });
    return portadas;
}

module.exports = router