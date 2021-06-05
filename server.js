const express = require("express");
const app = express();
const multer = require("multer");

//Constantes para encriptar con bcrypt
const bcrypt = require('bcrypt');
const saltRounds = 10;

const dotenv = require('dotenv');
// get config vars
dotenv.config();


const ejs = require('ejs');

const fs = require("fs");
const fsPro = fs.promises;
const path = require("path");

//Para usar ejs en los renders
app.set('views', './views');
app.set('view engine', 'ejs');

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded());

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// Configurar cabeceras y cors
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "POST, GET");
    next();
});

app.use(express.static("public"));
app.use(require('./routes/index'))
app.use('/admin', require('./routes/admin'))


app.listen(80, () => {
    console.log("El Kiosko ha abierto! 😈 Escuchando en http://localhost:80");
});

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

//Post para recibir imagenes introducidas por el admin
app.post("/uploadfile", upload.single("myFile"), (req, res, next) => {
    const file = req.file;
    if (!file) {
        const error = new Error("Please upload a file");
        error.httpStatusCode = 400;
        return next(error);
    }
    res.end(200);
});


app.post("/upload_things", upload.array("files"), uploadThings);

function uploadThings(req, res) {
    let coleccion = req.body.name;
    if(moverAColeccion(coleccion) == 1){
        res.send(200);
    }else{
        res.sendStatus(500);
        //send('El nombre de coleccion introducido ya esta utilizado')
    }
    
}
app.post("/upload_cromo", uploadCromos);

function uploadCromos(req, res) {
    
    //TODO sacar el usuario del token o lo que sea
    let usuario = 'RuboAdmin';
    let nombre = req.body.nombre;
    let ruta = 'proximamente';
    let precio = req.body.precio;
    let cantidad = req.body.cantidad;
    let coleccion = req.body.nombreColeccion;
    let album;
    require('./DBHandler.js').getAlbum(usuario, coleccion)
        .then(function(id){
            album = id;
            for(let i = 0; i < cantidad; i++){
                require('./DBHandler.js').insertarCromo(nombre, ruta, precio, album, coleccion);
            }
            res.sendStatus(200);
        })
        .catch(function(err){
            console.log(err);
        })
}

app.post("/crear_album", crearAlbum);

function crearAlbum(req, res) {
    let coleccion = req.body.nombreColeccion;
    //TODO HARDCODEO EL USUARIO RUBOADMIN PERO AQUI SE NECESITA PASAR EL NOMBRE DEL USUARIO CON TOKEN O LO QUE SEA
    let usuario = 'RuboAdmin';
    //TODO lo del estado pues ni idea, supongo que de igual
    let estado = 'finalizada'
    require('./DBHandler.js').insertarAlbum(usuario, coleccion, estado);
    //console.log(req)
    res.sendStatus(200);
}

app.post('/crear_coleccion', crearColeccion);

function crearColeccion(req, res){
    let nombre = req.body.nombreColeccion;
    let precioAlbum = req.body.precio;
    let estado = 'activa';
    require('./DBHandler.js').insertarColeccion(nombre, precioAlbum, estado);
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


app.get("/modificaColeccion", renderiza);

function renderiza(req, res) {
    let coleccion = req.query.nombreColeccion;
    let dir = 'public/cromos/' + coleccion;
    fs.readdir(dir, (err, archivos) => {
        if (err) {
            console.log(err);
            return;
        }
        //console.log(archivos);
        res.render('cromos', { nombreColeccion: coleccion, fotos: archivos });
    });
}

app.post('/registar_usuario', registrar_usuario)
function registrar_usuario(req, res) {

    bcrypt.hash(req.body.contrasenya, saltRounds, function (err, hash) {
        console.log("Tenemos este hash!", hash)
        require('./DBHandler.js').registrar_usuario(req.body.usuario, hash, req.body.tipo)
            .then(function () {
                res.json({ error: 'no' })
            })
            .catch(function (error) {
                if (error['code'] === 'ER_DUP_ENTRY') {
                    // Error de que la primary key este duplicada
                    res.json({ error: 'duplicado' })
                } else {
                    console.log(error)
                }
            });
    })
}
