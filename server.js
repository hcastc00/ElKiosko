const express = require("express");
const app = express();
const multer = require("multer");

const dotenv = require('dotenv');
// get config vars
dotenv.config();

const cookieParser = require("cookie-parser");

//Para usar ejs en los renders
app.set('views', './views');
app.set('view engine', 'ejs');

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded());

// Parse JSON bodies (as sent by API clients)
app.use(express.json());
app.use(cookieParser());

// Configurar cabeceras y cors
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "POST, GET");
    next();
});

app.use(express.static("public"));
app.use(require('./routes/index'))
app.use('/admin', require('./routes/admin'))
app.use('/socio', require('./routes/socio'))


app.listen(80, () => {
    console.log("El Kiosko ha abierto! 😈 Escuchando en http://localhost:80");
});
