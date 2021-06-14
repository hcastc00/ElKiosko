function crearColeccion() {

  if (hayVacios()) {
    $.toast({
      text: 'Rellene todos los campos antes de crear la colección',
      title: 'FALTAN CAMPOS',
      icon: "error",
      position: "top-right",
      hideAfter: 8000
    })
  } else {

    //Primero crear la coleccion para poder asignarsela al album
    let precioAlbum = document.getElementById("precioAlbum").value;
    $.post('/admin/crear_coleccion', {
      nombreColeccion: nombreColeccion,
      precio: precioAlbum
    });

    //Album base correspondiente al administrador que esta creando esta coleccion
    $.post("/admin/crear_album", {
      nombreColeccion: nombreColeccion
    }, function (res){
      //Mando los cromos

      var cromosJSON = [];
      var cromoJSONBase;

      $("[id^=formulario_]").each(function () {
        let nombre = this[0].value;
        let precio = this[1].value;
        let cantidad = this[2].value;

        let ruta = this.id.replace("formulario_", "");
        cromoJSONBase = {nombre: nombre, precio: precio, cantidad: cantidad, ruta: ruta, nombreColeccion: nombreColeccion};
        cromosJSON = cromosJSON.concat(cromoJSONBase);
        console.log(cromosJSON);
      });

      //Se sube la informacion de los cromos uno a uno
      $.post(
          "/admin/upload_cromos",
          {
            cromosJSON : cromosJSON,
            nombreColeccion: nombreColeccion
          }
      );


    });
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