function registrar(){
    console.log('Estoy registrando')
}

function imagenIntroducida(){
    console.log('Ha cambiado la imagen del formulario')
}

function enviaFormulario(){
    console.log('Estoy enviando el formulario');
    let fichero = document.getElementById('imagen').value;
    console.log(fichero);

    $.post("http://localhost/images", {file: fichero} , function(result){
        console.log('La respuesta del server es: ', result);
    });
}