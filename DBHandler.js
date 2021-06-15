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
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        } else {
            console.log(err);
        }
    })
}

handleDisconnect()

const insertarAlbum = function insertarAlbum(usuario, coleccion, estado) {
    return new Promise((resolve, reject) => {
        $query = 'INSERT INTO albumes (usuario, coleccion, estado) VALUES (?, ?, ?)';

        connection.query($query, [usuario, coleccion, estado], function (err, rows, fields) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    })
}

const getAlbum = function getAlbum(usuario, coleccion) {
    return new Promise(function (resolve, reject) {

        $query = 'SELECT id FROM albumes WHERE usuario = ? AND coleccion = ?';
        connection.query($query, [usuario, coleccion], function (err, rows, fields) {
            if (err || rows[0] == null) {
                console.log("Este usuario no tiene ese album");
                reject('Este usuario no tiene ese album');
            } else {
                resolve(rows[0].id);
            }
        });
    });
}

const getAlbumesUsuario = function getAlbumesUsuario(usuario) {
    return new Promise(function (resolve, reject) {

        $query = 'SELECT coleccion AS nombre, id FROM albumes WHERE usuario = ?';
        connection.query($query, [usuario], function (err, rows, fields) {
            if (err || rows[0] == null) {
                console.log("Este usuario no tiene albumes");
                reject('Este usuario no tiene albumes');
            } else {
                resolve(rows);
            }
        });
    });

}

const getNumeroCromosAlbum = function getNumeroCromosAlbum(usuario, coleccion) {
    return new Promise(function (resolve, reject) {

        $query = 'select count(distinct ruta_imagen) from cromos ' +
            'inner join colecciones on cromos.coleccion = colecciones.nombre ' +
            'inner join albumes  on cromos.album = albumes.id ' +
            'inner join socios  on albumes.usuario = socios.usuario ' +
            'where socios.usuario = ? and colecciones.nombre = ?';
        connection.query($query, [usuario, coleccion], function (err, rows, fields) {
            if (err || rows[0] == null) {
                console.log("Este usuario no tiene cromos de ese album");
                reject('Este usuario no tiene cromos de ese album');
            } else {
                resolve(rows[0]);
            }
        });
    });

}

const getCromosAlbum = function getCromosAlbum(album) {
    return new Promise(function (resolve, reject) {
        $query = 'SELECT * '
            + 'FROM albumes, cromos '
            + 'WHERE albumes.id = ? AND cromos.album = albumes.id';

        connection.query($query, [album], function (err, rows, fields) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        })
    })
}

const getCromosColeccion = function getCromosColeccion(coleccion) {
    return new Promise(function (resolve, reject) {
        $query = 'SELECT *, COUNT(ruta_imagen) as repeticiones ' +
            'FROM cromos WHERE ' +
            'coleccion = ? GROUP ' +
            'BY ruta_imagen';

        connection.query($query, [coleccion], function (err, rows, fields) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        })
    })
}

const insertarColeccion = function insertarColeccion(nombre, precio_album, estado) {
    return new Promise((resolve, reject) => {

            $query = 'INSERT INTO colecciones (nombre, precio_album, estado) VALUES (?, ?, ?)';

            connection.query($query, [nombre, precio_album, estado], function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            })
        }
    )
}

const insertarCromo = function insertarCromo(nombre, ruta, precio, album, nombreColeccion) {
    return new Promise((resolve, reject) => {
        $query = 'INSERT INTO cromos (nombre, ruta_imagen, precio, album, coleccion) VALUES (?, ?, ?, ?, ?)';

        connection.query($query, [nombre, ruta, precio, album, nombreColeccion], function (err, rows, fields) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    })
}

const insertarCromos = function insertarCromos(nombre, ruta, precio, album, nombreColeccion) {
    return new Promise((resolve, reject) => {
        $query = 'INSERT INTO cromos (nombre, ruta_imagen, precio, album, coleccion) VALUES (?, ?, ?, ?, ?)';

        connection.query($query, [nombre, ruta, precio, album, nombreColeccion], function (err, rows, fields) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    })
}

const duplicarCromo = function duplicarCromo(ruta, album, coleccion, n_repeticiones) {

    let datos_cromo = []
    let datos_cromos = []
    return new Promise(function (resolve, reject) {
        $query = 'SELECT nombre, ruta_imagen, precio, coleccion FROM cromos WHERE ruta_imagen = ? AND coleccion = ?'
        connection.query($query, [ruta, coleccion], function (err, rows, fields) {
            if (err) {
                reject(err);
            } else {

                for (let i in rows[0]) {
                    datos_cromo.push(rows[0][i]);
                }
                datos_cromo.push(album)
                datos_cromos = datos_cromo

                $query = 'INSERT INTO cromos (nombre, ruta_imagen, precio, coleccion, album) VALUES (?, ?, ?, ?, ?)';
                for (let i = 1; i < n_repeticiones; i++) {
                    $query += ', (?, ?, ?, ?, ?)'
                    datos_cromos = datos_cromos.concat(datos_cromo)
                }

                connection.query($query, datos_cromos, function (err, rows, fields) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            }
        });
    })
}

const getCromosAlaVenta = function getCromosAlaVenta(coleccion) {
    return new Promise(function (resolve, reject) {

        $query = 'SELECT cromos.id, cromos.nombre, cromos.ruta_imagen, cromos.precio, COUNT(cromos.id) AS reps FROM cromos '
            + 'INNER JOIN albumes ON cromos.album = albumes.id '
            + 'INNER JOIN usuarios ON albumes.usuario = usuarios.nombre '
            + 'WHERE usuarios.tipo = "admin" AND cromos.coleccion = ? '
            + 'GROUP BY cromos.ruta_imagen';

        connection.query($query, [coleccion], function (err, rows, fields) {
            if (err) {
                console.log("An error ocurred performing the query.");
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

const tieneDineroParaCromo = function tieneDineroParaCromo(cromo, socio) {
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

const tieneCromoEnAlbum = function tieneCromoEnAlbum(rutaCromo, album) {
    return new Promise(function (resolve, reject) {
        $query = 'SELECT COUNT(cromos.ruta_imagen) as num '
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

const modificaSaldo = function modificaSaldo(socio, dinero) {
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

const getSaldo = function getSaldo(socio) {
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

const tieneDineroParaAlbum = function tieneDineroParaAlbum(socio, album) {
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

const venderCromo = function venderCromo(cromo, album) {
    return new Promise(function (resolve, reject) {
        $query = 'SELECT COUNT(id) as num FROM albumes WHERE id = ?'

        connection.query($query, [album], function (err, rows, fields) {
            if (err || rows[0].num === 0) {
                console.log("No tiene el album necesario para comprar ese cromo");
                reject("No tiene el album necesario para comprar ese cromo");
            } else {
                $query = 'UPDATE cromos SET cromos.album = ? WHERE cromos.id = ?'

                connection.query($query, [album, cromo], function (err, filas, fields) {
                    if (err) {
                        console.log("An error ocurred performing the query.");
                        reject(err);
                    } else {
                        resolve(filas);
                    }
                });
            }
        });
    });
}

const venderAlbum = function venderAlbum(usuario, album) {

    return new Promise(function (resolve, reject) {

        $query = 'INSERT INTO albumes (usuario, coleccion, estado) '
            + 'SELECT ?, colecciones.nombre, "no iniciada" '
            + 'FROM colecciones INNER JOIN albumes ON albumes.coleccion = colecciones.nombre '
            + 'WHERE albumes.id = ?;'

        connection.query($query, [usuario, album], function (err, rows, fields) {
            if (err) {
                console.log("An error ocurred performing the query.");
                reject('No puede comprar de nuevo un album que ya ha comprado.');
            } else {
                resolve(rows);
            }
        });
    });
}

const getColeccionesActivas = function getColeccionesActivas() {

    return new Promise(function (resolve, reject) {

        $query = 'SELECT colecciones.nombre, colecciones.precio_album, albumes.id '
            + 'FROM colecciones '
            + 'INNER JOIN albumes ON colecciones.nombre=albumes.coleccion '
            + 'WHERE colecciones.estado="activa" '
            + 'GROUP BY colecciones.nombre';

        connection.query($query, function (err, rows, fields) {
            if (err) {
                console.log("An error ocurred performing the query.");
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

const getEstadoColeccion = function getEstadoColeccion(coleccion) {

    return new Promise(function (resolve, reject) {

        $query = 'SELECT estado FROM colecciones WHERE nombre = ?';

        connection.query($query, [coleccion], function (err, rows, fields) {
            if (err) {
                console.log("An error ocurred performing the query.");
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

const setEstadoColeccion = function setEstadoColeccion(estado, coleccion) {

    $query = 'UPDATE colecciones SET estado = ? WHERE nombre = ?'

    return new Promise(function (resolve, reject) {
        connection.query($query, [estado, coleccion], function (err, rows, fields) {
            if (err) {
                console.log("An error ocurred performing the query.");
                console.log(err);
                reject(err);
            }
            resolve()
        });
    })
}

const setEstadoAlbum = function setEstadoAlbum(estado, album) {

    $query = 'UPDATE albumes SET estado = ? WHERE id = ?'

    return new Promise(function (resolve, reject) {
        connection.query($query, [estado, album], function (err, rows, fields) {
            if (err) {
                console.log("An error ocurred performing the query.");
                console.log(err);
                reject(err);
            }
            resolve()
        });
    })
}

const login = function login(usuario, contrasenya) {
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

const registrar_usuario = function registrar_usuario(usuario, contrasenya, tipo) {
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

const get_usuario = function get_usuario(nombre) {
    return new Promise(function (resolve, reject) {
        $query = 'SELECT * FROM usuarios WHERE usuarios.nombre = ?';

        connection.query($query, [nombre], function (err, rows, fields) {
            if (err) {
                console.log("An error ocurred performing the query.");
                reject(err);
            }

            if (rows.length > 0) {

                resolve(rows[0]);
            } else {
                resolve("null")
            }
        });
    });
}

module.exports = {
    insertarAlbum,
    getAlbum,
    getAlbumesUsuario,
    getNumeroCromosAlbum,
    getCromosAlbum,
    getCromosColeccion,
    insertarColeccion,
    insertarCromo,
    insertarCromos,
    duplicarCromo,
    getCromosAlaVenta,
    tieneDineroParaCromo,
    tieneCromoEnAlbum,
    modificaSaldo,
    getSaldo,
    tieneDineroParaAlbum,
    venderCromo,
    venderAlbum,
    getColeccionesActivas,
    getEstadoColeccion,
    setEstadoColeccion,
    setEstadoAlbum,
    login,
    registrar_usuario,
    get_usuario
}