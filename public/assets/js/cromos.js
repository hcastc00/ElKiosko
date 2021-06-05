function crearColeccion() {

  //TODO comprobar que ninguno de los campos esta vacio
  if(hayVacios()){
    alert('Rellene todos los campos antes de darle al boton de enviar.')
  }else{

    //Primero de todo crear la coleccion para poder asignarsela al album
    let precioAlbum = document.getElementById("precioAlbum").value;
    $.post('/crear_coleccion', {
      nombreColeccion: nombreColeccion,
      precio: precioAlbum
    });


    //Album base correspondiente al administrador que esta creando esta coleccion
    $.post("/crear_album", {
      nombreColeccion: nombreColeccion
      //TODO aqui mandar tb el usuario
    });

    //Mando los cromos
    $("[id^=formulario_]").each(function () {
      let nombre = this[0].value;
      let precio = this[1].value;
      let cantidad = this[2].value;

      //Se sube la informacion de los cromos uno a uno
      $.post(
        "/upload_cromo",
        { nombre: nombre, 
          precio: precio, 
          nombreColeccion: nombreColeccion, 
          cantidad: cantidad },
        function (res) {
          console.log("enviao");
        }
      );
    });
  }
}

function hayVacios(){
  let vacio = false;
  $("[id^=formulario_]").each(function () {
      let nombre = this[0].value;
      let precio = this[1].value;
      let cantidad = this[2].value;
      
      if(nombre == "" || precio == "" || cantidad == ""){
        vacio = true;
        //Esto no retorna la funcion, funciona como un break para la funcion each de jquery
        return false;
      }
  });
  //Este es el verdadero retorno de la funcion
  return vacio;
}
