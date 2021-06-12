//Conexion con la base de datos
var mysql = require('mysql');

//Constantes para encriptar con bcrypt
const bcrypt = require('bcrypt');

var connection

function handleDisconnect() {
    connection = mysql.createConnection({
        host: 'lishowebproject.a2hosted.com',
        user: 'lishoweb_kiosko',
        password: 'VfuFxOckMXBk',
        database: 'lishoweb_kiosko'
    })

    connection.on('error', function (err) {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.log("Se ha manejado el cierre de conexion con la base de datos")                               // Connection to the MySQL server is usually
            handleDisconnect();                         // lost due to either server restart, or a
        } else {                                      // connnection idle timeout (the wait_timeout
            throw err;                                  // server variable configures this)
        }
    })
}

handleDisconnect()

module.exports.insertarAlbum = function insertarAlbum(usuario, coleccion, estado) {

    $query = 'INSERT INTO albumes (usuario, coleccion, estado) VALUES (?, ?, ?)';

    connection.query($query, [usuario, coleccion, estado], function (err, rows, fields) {
        if (err) {
            reject(err);
        } else {
            console.log('Query succesfully executed');
            resolve(rows);
        }
    });
}

module.exports.getAlbum = function getAlbum(usuario, coleccion) {

    return new Promise(function (resolve, reject) {

        $query = 'SELECT id FROM albumes WHERE usuario = ? AND coleccion = ?';
        connection.query($query, [usuario, coleccion], function (err, rows, fields) {
            if (err || rows[0] == null) {
                console.log("Este usuario no tiene ese album");
                //console.log(err);
                reject('Este usuario no tiene ese album');
            } else {
                console.log("Query succesfully executed: ", rows);
                resolve(rows[0].id);
            }
        });
    });
}

module.exports.getAlbumesUsuario = function getAlbumesUsuario(usuario){

    return new Promise(function (resolve, reject) {

        $query = 'SELECT coleccion AS nombre FROM albumes WHERE usuario = ?';
        connection.query($query, [usuario], function (err, rows, fields) {
            if (err || rows[0] == null) {
                console.log("Este usuario no tiene albumes");
                //console.log(err);
                reject('Este usuario no tiene albumes');
            } else {
                console.log("Query succesfully executed: ", rows);
                resolve(rows);
            }
        });
    });

}

module.exports.getNumeroCromosAlbum = function getNumeroCromosAlbum(usuario, coleccion){

    return new Promise(function (resolve, reject) {

        $query = 'select count(distinct ruta_imagen) from cromos '+
        'inner join colecciones on cromos.coleccion = colecciones.nombre '+
        'inner join albumes  on cromos.album = albumes.id '+
        'inner join socios  on albumes.usuario = socios.usuario '+
        'where socios.usuario = ? and colecciones.nombre = ?';
        connection.query($query, [usuario, coleccion], function (err, rows, fields) {
            if (err || rows[0] == null) {
                console.log("Este usuario no tiene cromos de ese album");
                //console.log(err);
                reject('Este usuario no tiene cromos de ese album');
            } else {
                console.log("Query succesfully executed: ", rows);
                resolve(rows[0]);
            }
        });
    });

}


module.exports.getCromosAlbum = function getCromosAlbum(album) {
    return new Promise(function (resolve, reject) {
        $query = 'SELECT * '
            + 'FROM albumes, cromos '
            + 'WHERE albumes.id = ? AND cromos.album = albumes.id';

        connection.query($query, [album], function (err, rows, fields) {
            if (err) {
                reject(err);
            } else {
                console.log('Query succesfully executed');
                resolve(rows);
            }
        })
    })
}


module.exports.insertarColeccion = function insertarColeccion(nombre, precio_album, estado) {
    // Perform a query
    $query = 'INSERT INTO colecciones (nombre, precio_album, estado) VALUES (?, ?, ?)';

    connection.query($query, [nombre, precio_album, estado], function (err, rows, fields) {
        if (err) {
            reject(err);
        } else {
            console.log('Query succesfully executed');
            resolve(rows);
        }
    });
}


module.exports.insertarCromo = function insertarCromo(nombre, ruta, precio, album, nombreColeccion) {
    // Perform a query
    $query = 'INSERT INTO cromos (nombre, ruta_imagen, precio, album, coleccion) VALUES (?, ?, ?, ?, ?)';

    connection.query($query, [nombre, ruta, precio, album, nombreColeccion], function (err, rows, fields) {
        if (err) {
            reject(err);
        } else {
            console.log('Query succesfully executed');
            resolve(rows);
        }
    });
}


module.exports.getCromosAlaVenta = function getCromosAlaVenta(coleccion) {

    return new Promise(function (resolve, reject) {

        $query = 'SELECT cromos.id, cromos.nombre, cromos.ruta_imagen, cromos.precio, COUNT(cromos.id) AS reps FROM cromos '
            + 'INNER JOIN albumes ON cromos.album = albumes.id '
            + 'INNER JOIN usuarios ON albumes.usuario = usuarios.nombre '
            + 'WHERE usuarios.tipo = "admin" AND cromos.coleccion = ? '
            + 'GROUP BY cromos.ruta_imagen';

        connection.query($query, [coleccion], function (err, rows, fields) {
            if (err) {
                console.log("An error ocurred performing the query.");
                //console.log(err);
                reject(err);
            } else {
                console.log("Query succesfully executed: ", rows);
                resolve(rows);
            }
        });
    });
}

module.exports.tieneDineroParaCromo = function tieneDineroParaCromo(cromo, socio) {
    return new Promise(function (resolve, reject) {
        $query = 'SELECT socios.usuario '
            + 'FROM socios, cromos '
            + 'WHERE socios.usuario = ? AND cromos.id = ? AND socios.saldo >= cromos.precio';

        connection.query($query, [socio, cromo], function (err, rows, fields) {
            if (rows[0] == null) {
                console.log("No tiene saldo necesario para comprar ese cromo");
                reject('NO hay saldo suficiente');
            } else {
                resolve('Hay saldo suficiente')
            }
        })
    })
}


module.exports.tieneCromoEnAlbum = function tieneCromoEnAlbum(rutaCromo, album) {
    return new Promise(function (resolve, reject) {
        $query = 'SELECT COUNT(cromos.id) as num '
            + 'FROM cromos '
            + 'INNER JOIN albumes ON cromos.album = albumes.id '
            + 'WHERE cromos.ruta_imagen = ? AND albumes.id = ?'

        connection.query($query, [rutaCromo, album], function (err, rows, fields) {
            if (rows[0].num > 0) {
                console.log("Este usuario ya tiene este cromo en ese album");
                reject("Cromo ya existente en album");
            } else {
                resolve("El cromo no esta, puede comprarlo")
            }
        })
    })
}


module.exports.modificaSaldo = function modificaSaldo(socio, dinero) {
    return new Promise(function (resolve, reject) {
        $query = 'UPDATE socios SET saldo = saldo + ? WHERE usuario = ?'

        connection.query($query, [dinero, socio], function (err, rows, fields) {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve('Modificado correctamente')
            }
        })
    })
}


module.exports.getSaldo = function getSaldo(socio) {
    return new Promise(function (resolve, reject) {
        $query = 'SELECT saldo FROM socios WHERE usuario = ?'

        connection.query($query, [socio], function (err, rows, fields) {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve(rows[0])
            }
        })
    })
}


module.exports.tieneDineroParaAlbum = function tieneDineroParaAlbum(socio, album) {
    return new Promise(function (resolve, reject) {
        $query = 'SELECT socios.usuario '
            + 'FROM socios, albumes '
            + 'INNER JOIN colecciones ON albumes.coleccion = colecciones.nombre '
            + 'WHERE socios.usuario = ? AND albumes.id = ? AND socios.saldo >= colecciones.precio_album';

        connection.query($query, [socio, album], function (err, rows, fields) {
            if (rows[0] == null) {
                console.log("No tiene saldo necesario para comprar ese cromo");
                reject('NO hay saldo suficiente');
            } else {
                resolve('Hay saldo suficiente')
            }
        })
    })
}


module.exports.venderCromo = function venderCromo(cromo, usuario) {


    return new Promise(function (resolve, reject) {
        $query = 'SELECT albumes.id FROM albumes '
            + 'INNER JOIN usuarios ON albumes.usuario = usuarios.nombre '
            + 'INNER JOIN colecciones ON albumes.coleccion = colecciones.nombre '
            + 'INNER JOIN cromos ON albumes.coleccion = cromos.coleccion '
            + 'WHERE usuarios.nombre = ? AND colecciones.nombre = cromos.coleccion '
            + 'GROUP BY albumes.id;'

        connection.query($query, [usuario], function (err, rows, fields) {
            if (err || rows[0] == null) {
                console.log("No tiene el album necesario para comprar ese cromo");
                reject("No tiene el album necesario para comprar ese cromo");
            } else {
                console.log("Query succesfully executed: ", rows);

                $query = 'UPDATE cromos SET cromos.album = ? WHERE cromos.id = ?'

                connection.query($query, [rows[0].id, cromo], function (err, filas, fields) {
                    if (err) {
                        console.log("An error ocurred performing the query.");
                        reject(err);
                    } else {
                        console.log("Query succesfully executed: ", filas);
                        resolve(filas);
                    }
                });
            }
        });
    });
}


module.exports.generarCopiasCromos = function generarCopiasCromos(cromo, numCopias) {

    //TODO o hacer un for marronero o una PROCEDURE en SQL para meter las copias de los cromos especificadas
    //O que el usuario vaya de uno en uno

    return new Promise(function (resolve, reject) {
        $query = 'INSERT INTO cromos (nombre, ruta_imagen, precio, album, coleccion) '
            + 'SELECT nombre, ruta_imagen, precio, album, coleccion '
            + 'FROM cromos '
            + 'WHERE id = ?;';

        connection.query($query, [cromo], function (err, rows, fields) {
            if (err) {
                reject(err)
            } else {
                resolve()
            }
        })
    });
}


module.exports.venderAlbum = function venderAlbum(usuario, album) {

    return new Promise(function (resolve, reject) {

        $query = 'INSERT INTO albumes (usuario, coleccion, estado) '
            + 'SELECT ?, colecciones.nombre, "no iniciada" '
            + 'FROM colecciones INNER JOIN albumes ON albumes.coleccion = colecciones.nombre '
            + 'WHERE albumes.id = ?;'

        connection.query($query, [usuario, album], function (err, rows, fields) {
            if (err) {
                console.log("An error ocurred performing the query.");
                //console.log(err);
                reject('No puede comprar de nuevo un album que ya ha comprado.');
            } else {
                console.log("Query succesfully executed: ", rows);
                resolve(rows);
            }
        });
    });
}


module.exports.getColeccionesActivas = function getColeccionesActivas() {

    return new Promise(function (resolve, reject) {

        $query = 'SELECT colecciones.nombre, colecciones.precio_album, albumes.id '
            + 'FROM colecciones '
            + 'INNER JOIN albumes ON colecciones.nombre=albumes.coleccion '
            + 'WHERE colecciones.estado="activa" '
            + 'GROUP BY colecciones.nombre';

        connection.query($query, function (err, rows, fields) {
            if (err) {
                console.log("An error ocurred performing the query.");
                //console.log(err);
                reject(err);
            } else {
                console.log("Query succesfully executed: ", rows);
                resolve(rows);
            }


        });
    });
}

module.exports.getEstadoColeccion = function getEstadoColeccion(coleccion) {

    return new Promise(function (resolve, reject) {

        $query = 'SELECT estado FROM colecciones WHERE nombre = ?';

        connection.query($query,[coleccion], function (err, rows, fields) {
            if (err) {
                console.log("An error ocurred performing the query.");
                //console.log(err);
                reject(err);
            } else {
                console.log("Query succesfully executed: ", rows);
                resolve(rows);
            }


        });
    });
}

module.exports.setEstadoColeccion = function setEstadoColeccion(estado, coleccion) {

    $query = 'UPDATE colecciones SET estado = ? WHERE nombre = ?'

    return new Promise(function (resolve, reject) {
        connection.query($query, [estado, coleccion], function (err, rows, fields) {
            if (err) {
                console.log("An error ocurred performing the query.");
                console.log(err);
                reject(err);
            }
            resolve()
            console.log("Query succesfully executed: ", rows);
        });
    })
}


module.exports.login = function login(usuario, contrasenya) {
    return new Promise(function (resolve, reject) {
        $query = 'SELECT nombre, tipo, contrasenya FROM usuarios WHERE usuarios.nombre = ?';

        connection.query($query, [usuario, contrasenya], function (err, rows, fields) {
            if (err) {
                console.log(err)
                reject(err)
            }
            if (rows.length > 0) {

                bcrypt.compare(contrasenya, rows[0]['contrasenya'])
                    .then(function (result) {
                        if (result) {
                            delete rows[0]['contrasenya']
                            resolve(rows[0])
                        } else {
                            resolve("null")
                        }
                    });

            } else {
                resolve("null")
            }
        })
    });
}


module.exports.registrar_usuario = function registrar_usuario(usuario, contrasenya, tipo) {
    return new Promise(function (resolve, reject) {
        $query = 'INSERT INTO usuarios (nombre, contrasenya, tipo) VALUES (?, ?, ?)';

        connection.query($query, [usuario, contrasenya, tipo], function (err, rows, fields) {
            if (err) {
                reject(err)
            } else {
                resolve(usuario, tipo)
            }
        })

        if (tipo == 'admin') {
            $query = 'INSERT INTO admins (usuario) VALUES (?)';

            connection.query($query, [usuario], function (err, rows, fields) {
                if (err) {
                    console.log(err)
                    reject(err)
                } else {
                    resolve(usuario, tipo)
                }
            })
        } else {
            $query = 'INSERT INTO socios (usuario, saldo) VALUES (?, ?)';

            connection.query($query, [usuario, 0], function (err, rows, fields) {
                if (err) {
                    console.log(err)
                    reject(err)
                } else {
                    resolve(usuario, tipo)
                }
            })
        }


    });
}

//Para importar el token de refresco
module.exports.guardar_tokenrefresco = function importar_tokenrefresco(token, nombre) {
    $query = 'UPDATE usuarios SET token_refresco = ? Where nombre = ?'

    return new Promise(function (resolve, reject) {
        connection.query($query, [token, nombre], function (err, rows, fields) {
            if (err) {
                console.log("An error ocurred performing the query.");
                console.log(err);
                reject(err);
            }
            resolve()
            console.log("Query succesfully executed: ", rows);
        });
    })
}


//Revisar el resolve que no se como va
module.exports.get_usuario = function get_usuario(nombre) {
    return new Promise(function (resolve, reject) {
        $query = 'SELECT * FROM usuarios WHERE usuarios.nombre = ?';

        connection.query($query, [nombre], function (err, rows, fields) {
            if (err) {
                console.log("An error ocurred performing the query.");
                //console.log(err);
                reject(err);
            }

            if (rows.length > 0) {
                console.log("Query succesfully executed: ", rows);
                resolve(rows[0]);
            } else {
                resolve("null")
            }
        });
    });
}