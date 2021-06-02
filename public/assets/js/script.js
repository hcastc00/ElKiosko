  function submitForm() {
    let numberOfFiles = getNumberOfFiles();
    let nombreColeccion = document.getElementById("nombreColeccion").value;
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

      let dir = 'modificaColeccion?nombreColeccion=' + nombreColeccion;
      fetch("http://localhost:80/upload_things", {
        method: 'post',
        body: datosFormulario
      })
        .then((res) => location.href = dir)
        .catch((err) => ("Error occured", err));
    }
  }
      

  function registrar() {
    console.log("Estoy registrando");
  }

  function imagenIntroducida() {
    console.log("Ha cambiado la imagen del formulario");
  }
