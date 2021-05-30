//Conexion con la base de datos
var mysql = require('mysql');

var connection  = mysql.createConnection({
    host     : 'lishowebproject.a2hosted.com',
    user     : 'lishoweb_kiosko',
    password : 'VfuFxOckMXBk',
    database : 'lishoweb_kiosko'
});


// Perform a query
$query = 'SELECT * from albumes LIMIT 10';

connection.query($query, function(err, rows, fields) {
    if(err){
        console.log("An error ocurred performing the query.");
        return;
    }

    console.log("Query succesfully executed: ", rows);
});