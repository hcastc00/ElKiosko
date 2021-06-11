function crearColeccion() {

  //TODO comprobar que ninguno de los campos esta vacio
  if (hayVacios()) {
    $.toast({
      text: 'Rellene todos los campos antes de crear la colección',
      title: 'FALTAN CAMPOS',
      icon: "error",
      position: "top-right",
      hideAfter: 8000
    })
  } else {

    //Primero de todo crear la coleccion para poder asignarsela al album
    let precioAlbum = document.getElementById("precioAlbum").value;
    $.post('/admin/crear_coleccion', {
      nombreColeccion: nombreColeccion,
      precio: precioAlbum
    });


    //Album base correspondiente al administrador que esta creando esta coleccion
    $.post("/admin/crear_album", {
      nombreColeccion: nombreColeccion
    });

    //Mando los cromos
    $("[id^=formulario_]").each(function () {
      let nombre = this[0].value;
      let precio = this[1].value;
      let cantidad = this[2].value;
      let ruta = this.id.split('_')[1];

      //Se sube la informacion de los cromos uno a uno
      $.post(
        "/admin/upload_cromo",
        { nombre: nombre, 
          precio: precio, 
          nombreColeccion: nombreColeccion, 
          cantidad: cantidad,
          ruta: ruta 
        },
        function (res) {
          console.log("enviao");
        }
      );
    });

    $.toast({
      text: 'La colección se ha creado satisfactoriamente',
      title: 'CREADA',
      icon: "success",
      position: "top-right",
      hideAfter: 8000               
    })

    //TODO mirar a ver como se hace esto
    location.href = '/admin'
  }
}

function hayVacios() {
  let vacio = false;
  $("[id^=formulario_]").each(function () {
    let nombre = this[0].value;
    let precio = this[1].value;
    let cantidad = this[2].value;

    if (nombre == "" || precio == "" || cantidad == "") {
      vacio = true;
      //Esto no retorna la funcion, funciona como un break para la funcion each de jquery
      return false;
    }
  });

  if (document.getElementById('precioAlbum').value == "") {
    vacio = true;
  }

  //Este es el verdadero retorno de la funcion
  return vacio;
}
