$("#imagen").submit(function (e) {
    e.preventDefault();
    $.ajax({
      url: $(this).attr("action"),
      type: $(this).attr("method"),
      dataType: "file",
      data: new FormData(this),
      processData: false,
      contentType: false,
      complete: function(data) {
         console.log(data)
      },
    });
  });
  
  function registrar() {
    console.log("Estoy registrando");
  }
  
  function imagenIntroducida() {
    console.log("Ha cambiado la imagen del formulario");
  }
  
  function enviaFormulario() {
    console.log("Enviando");
    $("#imagen").submit();
  }