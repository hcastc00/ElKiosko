const express = require("express");
const app = express();
const multer = require("multer");

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded());

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// Configurar cabeceras y cors
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST");
  next();
});

app.use(express.static("public"));

app.listen(80, () => {
  console.log("El Kiosko ha abierto! 😈 Escuchando en http://localhost:80");
});

//Storage con multer
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "cromos");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

var upload = multer({ storage: storage });

// Post para recibir imagenes introducidas por el admin
app.post("/uploadfile", upload.single("myFile"), (req, res, next) => {
  const file = req.file;
  if (!file) {
    const error = new Error("Please upload a file");
    error.httpStatusCode = 400;
    return next(error);
  }
  res.send(200);
});
