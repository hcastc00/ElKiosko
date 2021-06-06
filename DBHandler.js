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


module.exports.insertarAlbum  = function insertarAlbum(usuario, coleccion, estado){
    // Perform a query
    $query = 'INSERT INTO albumes (usuario, coleccion, estado) VALUES ('
            + '"' + usuario + '", "' + coleccion + '", "' + estado + '")';

    connection.query($query, function(err, rows, fields) {
        if(err){
            console.log("An error ocurred performing the query.");
            console.log(err);
            return;
        }

        console.log("Query succesfully executed: ", rows);
    });
}

module.exports.getAlbum = function getAlbum(usuario, coleccion){

    return new Promise (function(resolve, reject){

        $query = 'SELECT id FROM albumes WHERE usuario = "' + usuario + '" AND coleccion = "' + coleccion + '"';
        connection.query($query, function(err, rows, fields) {
            if(err){
                console.log("An error ocurred performing the query.");
                //console.log(err);
                reject(err);
            }

            console.log("Query succesfully executed: ", rows);  
            resolve(rows[0].id);          
        });


    });
}


module.exports.insertarColeccion  = function insertarColeccion(nombre, precio_album, estado){
    // Perform a query
    $query = 'INSERT INTO colecciones (nombre, precio_album, estado) VALUES ('
            + '"' + nombre + '", "' + precio_album + '", "' + estado + '")';

    connection.query($query, function(err, rows, fields) {
    if(err){
        console.log("An error ocurred performing the query.");
        console.log(err);
        return;
    }

    console.log("Query succesfully executed: ", rows);
    });
}


module.exports.insertarCromo  = function insertarCromo(nombre, ruta, precio, album, nombreColeccion){
    // Perform a query
    $query = 'INSERT INTO cromos (nombre, ruta_imagen, precio, album, coleccion) '
        + 'VALUES ("' + nombre + '", "' + ruta + '", "' + precio 
        + '", "' + album + '", "' + nombreColeccion + '")';

    connection.query($query, function(err, rows, fields) {
        if(err){
            console.log("An error ocurred performing the query.");
            console.log(err);
            return;
        }

        console.log("Query succesfully executed: ", rows);
    });
}

module.exports.getNumCromosDisponibles = function getNumCromosDisponibles(coleccion, ruta){

    return new Promise (function(resolve, reject){

        $query = 'SELECT COUNT(id) as num FROM cromos WHERE coleccion = ? AND ruta_imagen = ?' 
                + 'AND  album.usuario.tipo = "admin" ';
        connection.query($query, [coleccion, ruta] , function(err, rows, fields) {
            if(err){
                console.log("An error ocurred performing the query.");
                //console.log(err);
                reject(err);
            }

            console.log("Query succesfully executed: ", rows);  
            resolve(rows[0].num);          
        });
    });
}


//insertarColeccion('Cars', 50, 'activa');
//insertarAlbum('RuboAdmin' , 'Cars', 'finalizada');
//insertarCromo('Mate', 'matias.png', '5', '7', 'Cars');


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

//Para importar el token de refresco
module.exports.importar_tokenrefresco = function importar_tokenrefresco(token){
    $query = 'INSERT INTO usuarios (token_refresco) VALUES ?';

    connection.query($query,[token], function(err, rows, fields) {
        if(err){
            console.log("An error ocurred performing the query.");
            console.log(err);
            return;
        }

        console.log("Query succesfully executed: ", rows);
    });
}