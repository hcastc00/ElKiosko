const express = require("express");
const app = express();
const multer = require("multer");
const jwt = require('jsonwebtoken');

//Constantes para encriptar con bcrypt
const bcrypt = require('bcrypt');
const saltRounds = 10;

const dotenv = require('dotenv');
// get config vars
dotenv.config();


const ejs = require('ejs');

const fs = require("fs");
const path = require("path");

//Para usar ejs en los renders
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
app.use(express.static("cromos"));

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

var upload = multer({storage: storage});

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
    //console.log('Este es el post');
    let coleccion = req.body.name;
    moverAColeccion(coleccion);
    let url = 'modificaColeccion?nombreColeccion=' + coleccion;
    //res.redirect(301, 'modificaColeccion');
    //res.send({respuesta: url});
    res.send(200);
}

function moverAColeccion(coleccion) {
    let newDir = 'cromos/' + coleccion;
    if (!fs.existsSync(newDir)) {
        fs.mkdirSync(newDir);
    }

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
}


app.get("/modificaColeccion", renderiza);

function renderiza(req, res) {
    let coleccion = req.query.nombreColeccion;
    let dir = 'cromos/' + coleccion;
    let abs = path.resolve(dir);
    fs.readdir(dir, {basePath: abs}, (err, archivos) => {
        if (err) {
            console.log(err);
            return;
        }
        console.log(archivos);
        res.render('prueba', {nombreColeccion: coleccion, fotos: archivos});
    });
}

app.post('/login', login)

function login(req, res) {
    require('./DBHandler.js').login(req.body.usuario, req.body.contrasenya)
        .then(function (result) {
            if (result != "null") {
                const token = crear_token({'nombre': result['nombre'], 'tipo': result['tipo']})
                res.json({'datos': result, 'token': token})
            }

        })
        .catch(function (error) {
            console.log(error)
        })

}

app.post('/registar_usuario', registrar_usuario)
function registrar_usuario(req, res) {

    bcrypt.hash(req.body.contrasenya, saltRounds, function (err, hash) {
        console.log("Tenemos este hash!", hash)
        require('./DBHandler.js').registrar_usuario(req.body.usuario, hash, req.body.tipo)
            .then(function () {
                res.json({error: 'no'})
            })
            .catch(function (error) {
                if (error['code'] === 'ER_DUP_ENTRY') {
                    // Error de que la primary key este duplicada
                    res.json({error: 'duplicado'})
                } else {
                    console.log(error)
                }
            });
    })
}

app.all('/admin',function(req, res)  {
    console.log(req)
})

function crear_token(usuario) {
    return jwt.sign({'usuario': usuario}, process.env.TOKEN_SECRET, {expiresIn: 60*30})
}

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