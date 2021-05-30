
  function submitForm() {
    let numberOfFiles = getNumberOfFiles();
    const nombreColeccion = document.getElementById("nombreColeccion").value;
    if (numberOfFiles < 10) {
      notify_msg('Porfavor, introduzca al menos 10 imágenes para crear una colección.');
    }else if(nombreColeccion == ""){
      notify_msg('Porfavor, introduzca el nombre de la colección.');
    }else{
      console.log('SE ENVIA AHORA BRO');
      
      const files = document.getElementById("form-files");
      const datosFormulario = new FormData();
      datosFormulario.append("name", nombreColeccion);
      for (let i = 0; i < files.files.length; i++) {
        datosFormulario.append("files", files.files[i]);
      }
  

      fetch("http://localhost:80/upload_things", {
        method: 'post',
        body: datosFormulario
      })
        .then((res) => console.log(res))
        .catch((err) => ("Error occured", err));

      /*
      $.post("http://localhost:80/uploadmultiple", { datos: datosFormulario }, function (result) {
        console.log('Este es el resultado del post', result);
      });*/
  
      //$("#imagen").submit();
      //location.reload();
    }
  }
      

  function registrar() {
    console.log("Estoy registrando");
  }

  function imagenIntroducida() {
    console.log("Ha cambiado la imagen del formulario");
  }

  function enviaFormulario() {
    console.log("Enviando");
    //Solo se hace el POST si son exactamente 10 imagenes.

    let numberOfFiles = getNumberOfFiles();
    if (numberOfFiles < 10) {
      notify_msg('Debe introducir al menos 10 imágenes para crear una coleccion.');
    } else {
      $("#imagen").submit();
      //location.reload();
    }
  }