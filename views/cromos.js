function crearColeccion() {
  //Mando los cromos
  $("[id^=formulario_]").each(function () {
    console.log($(this).children);
    let nombre = this[0].value;
    let precio = this[1].value;
    //TODO album (tiene que ser el por defecto que hablamos)
    $.post(
      "/upload_cromo",
      { nombre: nombre, precio: precio, nombreColeccion: nombreColeccion },
      function (res) {
        console.log("enviao");
      }
    );

    //Crear album
    let precio = $("#precioAlbum").value;
    $.post("/crear_album", {
      nombreColeccion: nombreColeccion,
      precioAlbum: precioAlbum,
    });
  });
}
