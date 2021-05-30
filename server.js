const express = require("express");
const app = express();
const multer = require("multer");

const fs = require("fs");
const path = require("path");

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
  res.send(200);
});


app.post("/upload_things", upload.array("files"), uploadThings);
function uploadThings(req,res){
  let coleccion = req.body;
  moverAColeccion(coleccion.name);
  res.json({message:"Sucessfully uploaded files"});
}

function moverAColeccion(coleccion){
  let newDir = 'cromos/' + coleccion;
  if(!fs.existsSync(newDir)){
    fs.mkdirSync(newDir);
  }

  fs.readdir('tmp', function(err, list) {
    if(err) return done(err);
    let old = '';
    let newPath = '';
    for(let i = 0; i < list.length; i++){
      old = 'tmp/' + list[i];
      newPath = newDir + '/' + list[i];
      fs.rename(old, newPath, function(err){
        if(err) throw err;
      });
    }
  });
}