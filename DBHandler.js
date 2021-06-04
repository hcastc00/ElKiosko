//Conexion con la base de datos
var mysql = require('mysql');

//Constantes para encriptar con bcrypt
const bcrypt = require('bcrypt');

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

//insertarCromo('/cromos/matias.png');
//visualizarCromos();

module.exports.login  = function login(usuario, contrasenya){
    return new Promise(function (resolve, reject){
        $query = 'SELECT nombre, tipo, contrasenya FROM usuarios WHERE usuarios.nombre = ?';

        connection.query($query, [usuario, contrasenya], function(err, rows, fields) {
            if(err) {
                console.log(err)
                reject(err)
            }
            if (rows.length > 0) {

                bcrypt.compare(contrasenya, rows[0]['contrasenya'])
                    .then(function(result) {
                        if (result){
                            delete rows[0]['contrasenya']
                            resolve(rows[0])
                        }else {
                            resolve("null")
                        }
                });

            }else {
                resolve("null")
            }
        })
    });
}

module.exports.registrar_usuario  = function registrar_usuario(usuario, contrasenya, tipo){
    return new Promise(function (resolve, reject){
        $query = 'INSERT INTO usuarios (nombre, contrasenya, tipo) VALUES (?, ?, ?)';

        connection.query($query, [usuario, contrasenya, tipo], function(err, rows, fields) {
            if(err) {
                reject(err)
            }else {
                resolve(usuario, tipo)
            }
        })
    });
}
