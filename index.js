const express = require("express");
const application = express();

application.use(express.static("public"));

application.listen(80, () => {
  console.log("El Kiosko ha abierto! 😈 Escuchando en http://localhost:80");
});


//Conexion con la base de datos
var mysql = require('mysql');

var connection  = mysql.createConnection({
    host     : 'lishowebproject.a2hosted.com',
    user     : 'lishoweb_kiosko',
    password : 'VfuFxOckMXBk',
    database : 'lishoweb_kiosko'
});


// Perform a query
$query = 'SELECT * from colecciones LIMIT 10';

connection.query($query, function(err, rows, fields) {
    if(err){
        console.log("An error ocurred performing the query.");
        return;
    }

    console.log("Query succesfully executed: ", rows);
});