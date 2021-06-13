function submitForm() {
    let numberOfFiles = getNumberOfFiles();
    let nombreColeccion = document.getElementById("nombreColeccion").value;
    if (numberOfFiles < 10) {
        notify_msg('Porfavor, introduzca al menos 10 imágenes para crear una colección.');
    } else if (nombreColeccion == "") {
        notify_msg('Porfavor, introduzca el nombre de la colección.');
    } else {
        console.log('SE ENVIA AHORA BRO');

        const files = document.getElementById("form-files");
        const datosFormulario = new FormData();
        datosFormulario.append("name", nombreColeccion);
        for (let i = 0; i < files.files.length; i++) {
            datosFormulario.append("files", files.files[i]);
        }

        let dir = 'modificaColeccion?nombreColeccion=' + nombreColeccion;
        fetch("/admin/upload_things", {
            method: 'post',
            body: datosFormulario
        })
            .then(function (res) {
                console.log('Si que entra');
                $.get(dir);
                location.href = dir;
            })
            .catch((err) => ("Error occured", err));
    }
}

function login() {

    let campoUsuario = document.getElementById('usuario_login')
    let campoContrasenya = document.getElementById('contrasenya_login')
    let usuario = campoUsuario.value
    let contrasenya = campoContrasenya.value

    if (usuario != '' && usuario != null && contrasenya != '' && contrasenya != null) {
        console.log("hago el post")
        $.post("/login", {usuario: usuario, contrasenya: contrasenya},
            function (res) {
                if (!res.error) {
                    location.href = '/' + res.tipo
                } else if (res.error === 'combinacionErronea') {
                    campoUsuario.style.borderColor = 'red'
                    campoUsuario.style.borderWidth = '2px'
                    campoContrasenya.style.borderColor = 'red'
                    campoContrasenya.style.borderWidth = '2px'
                    campoContrasenya.value = ''

                    $.toast({
                        text: 'La combinación introducida es incorrecta.',
                        title: 'Combinacion erronea',
                        icon: "error",
                        position: "top-right",
                        hideAfter: 8000
                    })
                }
            })
    } else {
        if (usuario == '' || usuario == null){
            campoUsuario.style.borderColor = 'red'
            campoUsuario.style.borderWidth = '2px'
        }
        if (contrasenya == '' || contrasenya == null){
            campoContrasenya.style.borderColor = 'red'
            campoContrasenya.style.borderWidth = '2px'
        }
        let modalString = "Porfavor, rellene los campos en rojo."
        $.toast({
            text: 'Porfavor, rellene los campos en rojo.',
            title: 'Campos vacios',
            icon: "error",
            position: "top-right",
            hideAfter: 8000
        })
    }

    console.log(document.getElementById('loginForm').children)

}

function imagenIntroducida() {
    console.log("Ha cambiado la imagen del formulario");
}

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const error = urlParams.get('error')
if (error == 'caducado') {
    $(document).ready(function (){
        $(".modal").modal("toggle")
    })
}