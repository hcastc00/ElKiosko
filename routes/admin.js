express = require('express')
router = express.Router()

const fs = require('fs')
const {isAdmin} = require('../isAuth.js')
const {crearTokenAcceso, enviarTokenAcceso} = require('../tokens.js')
const multer = require("multer");

router.use((req, res, next) => {
        try {
            let token = isAdmin(req)
            //Refresco el token para ampliar el tiempo
            req.cookies.token_acceso = crearTokenAcceso(token.usuario.nombre, token.usuario.tipo)
            req.nombre = token.usuario.nombre
            next()
        } catch (e) {
            if (e.message === 'No tienes los permisos') {
                //Seria redirigir a vista de usuario
                res.redirect('/socio')
            } else if (e.name === 'TokenExpiredError') {
                res.redirect('/?err=caducado#loginForm')
            } else if (e.message === 'Necesitas iniciar sesion') {
                res.redirect('/?error=noSesion#loginForm')
            }
        }
    }
)



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



router.get('/', (req, res) => {
    res.render("admin", {nombre: req.nombre})
})

router.get('/crearColeccion', (req, res) => {
    res.render('crearColeccion')
})

router.get('/modificaColeccion', (req, res) => {
    let coleccion = req.query.nombreColeccion;
    let dir = 'public/cromos/' + coleccion;
    let leidos = fs.readdirSync(dir, { withFileTypes: true });
    let archivos = new Array();
    leidos.forEach(leido =>{
        archivos.push(leido.name)
    })
    /*fs.readdirSync(dir, (err, archivos) => {
        if (err) {
            console.log(err);
            return;
        }
    });*/
    console.log(archivos);
    res.render('cromos', { nombreColeccion: coleccion, fotos: archivos });
})


router.post("/upload_things", upload.array("files"), uploadThings);

function uploadThings(req, res) {
    let coleccion = req.body.name;
    if(moverAColeccion(coleccion) == 1){
        res.send(200);
    }else{
        res.sendStatus(500);
        //send('El nombre de coleccion introducido ya esta utilizado')
    }
    
}


router.post("/upload_cromo", uploadCromos);

function uploadCromos(req, res) {
    
    let usuario = req.nombre;
    let nombre = req.body.nombre;
    let ruta = req.body.ruta;
    let precio = req.body.precio;
    let cantidad = req.body.cantidad;
    let coleccion = req.body.nombreColeccion;
    let album;
    require('../DBHandler.js').getAlbum(usuario, coleccion)
        .then(function(id){
            album = id;
            for(let i = 0; i < cantidad; i++){
                require('../DBHandler.js').insertarCromo(nombre, ruta, precio, album, coleccion);
            }
            res.sendStatus(200);
        })
        .catch(function(err){
            console.log(err);
        })
}

router.post("/crear_album", crearAlbum);

function crearAlbum(req, res) {
    let coleccion = req.body.nombreColeccion;
    let usuario = req.nombre
    //TODO lo del estado pues ni idea, supongo que de igual
    let estado = 'finalizada'
    require('../DBHandler.js').insertarAlbum(usuario, coleccion, estado);
    //console.log(req)
    res.sendStatus(200);
}

router.post('/crear_coleccion', crearColeccion);

function crearColeccion(req, res){
    let nombre = req.body.nombreColeccion;
    let precioAlbum = req.body.precio;
    let estado = 'activa';
    require('../DBHandler.js').insertarColeccion(nombre, precioAlbum, estado)
}

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

module.exports = router