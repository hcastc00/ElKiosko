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


// connect to mysql
connection.connect(function(err) {
    // in case of error
    if(err){
        console.log(err.code);
        console.log(err.fatal);
    }
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

// Close the connection
connection.end(function(){
    // The connection has been closed
});