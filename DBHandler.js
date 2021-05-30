//Conexion con la base de datos
var mysql = require('mysql');

var connection  = mysql.createConnection({
    host     : 'lishowebproject.a2hosted.com',
    user     : 'lishoweb_kiosko',
    password : 'VfuFxOckMXBk',
    database : 'lishoweb_kiosko'
});


function insertarCromo(ruta){
    // Perform a query
    $query = 'INSERT INTO cromos (nombre, ruta_imagen, precio, album, coleccion) '
            + 'VALUES ("matias", "' + ruta + '", "60", "1", "Cars")';

    connection.query($query, function(err, rows, fields) {
        if(err){
            console.log("An error ocurred performing the query.");
            console.log(err);
            return;
        }

        console.log("Query succesfully executed: ", rows);
    });
}

function visualizarCromos(){
    // Perform a query
    $query = 'SELECT * from cromos LIMIT 10';

    connection.query($query, function(err, rows, fields) {
        if(err){
            console.log("An error ocurred performing the query.");
            return;
        }

        console.log("Query succesfully executed: ", rows);
    });
}

insertarCromo('/cromos/matias.png');
visualizarCromos();
