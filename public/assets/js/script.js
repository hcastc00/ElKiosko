function login() {

    let campoUsuario = document.getElementById('usuario_login')
    let campoContrasenya = document.getElementById('contrasenya_login')
    let usuario = campoUsuario.value
    let contrasenya = campoContrasenya.value

    if (usuario != '' && usuario != null && contrasenya != '' && contrasenya != null) {
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
        if (usuario == '' || usuario == null) {
            campoUsuario.style.borderColor = 'red'
            campoUsuario.style.borderWidth = '2px'
        }
        if (contrasenya == '' || contrasenya == null) {
            campoContrasenya.style.borderColor = 'red'
            campoContrasenya.style.borderWidth = '2px'
        }
        $.toast({
            text: 'Porfavor, rellene los campos en rojo.',
            title: 'Campos vacios',
            icon: "error",
            position: "top-right",
            hideAfter: 8000
        })
    }


}

$(document).ready(function () {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const error = urlParams.get('error')
    if (error === 'caducado') {
        $(".modal").modal("toggle")
    }

    document.getElementById("loginForm").addEventListener("keydown", function (e) {
        if (e.key === 'Enter') login()
    }, false);
})
