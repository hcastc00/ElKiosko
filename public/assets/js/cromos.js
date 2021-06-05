function crearColeccion() {
  //Mando los cromos
  $("[id^=formulario_]").each(function () {
    let nombre = this[0].value;
    let precio = this[1].value;
    let cantidad = this[2].value;
    //TODO album (tiene que ser el por defecto que hablamos)
    $.post(
      "/upload_cromo",
      { nombre: nombre, precio: precio, nombreColeccion: nombreColeccion, cantidad: cantidad },
      function (res) {
        console.log("enviao");
      }
    );
  });

  //Crear album
  let precioAlbum = document.getElementById("precioAlbum").value;
  $.post("/crear_album", {
    nombreColeccion: nombreColeccion,
    precioAlbum: precioAlbum,
  });
}
