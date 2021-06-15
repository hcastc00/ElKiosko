function registrar() {
    let usuario_campo = document.getElementById('usuario_registro')
    let contrasenya_campo = document.getElementById('contrasenya_registro')
    let contrasenya_r_campo = document.getElementById('repetir_contrasenya_registro')
    let terminos_campo = document.getElementById('check_terminos_registro')
    let usuario = usuario_campo.value
    let contrasenya = contrasenya_campo.value
    let contrasenya_r = contrasenya_r_campo.value
    let terminos = terminos_campo.checked
    let formulario_correcto = true

    if (usuario === '' || usuario == null) {
        formulario_correcto = false
        crear_toast("Terminos", "Porfavor, especifique un nombre de usuario")
    }
    if (contrasenya === '' || contrasenya == null) {
        formulario_correcto = false
        crear_toast("Contraseña", "Porfavor, especifique una contraseña")
    }
    if (contrasenya_r === '' || contrasenya_r == null) {
        formulario_correcto = false
        crear_toast("Contraseña", "Porfavor, confirme la contraseña")
    }
    if (contrasenya !== contrasenya_r) {
        formulario_correcto = false
        crear_toast("Contraseña", "La contraseña no coincide con la repetición.")
    }
    if (!terminos) {
        formulario_correcto = false
        crear_toast("Terminos", "Porfavor, acepte los términos y condiciones")
    }

    if (formulario_correcto) {
        $.post("/registro", {usuario: usuario, contrasenya: contrasenya, tipo: 'socio'}, function (res) {
            if (res.tipo === 'socio') {
                location.href = '/socio'
            } else if (res.tipo === 'admin') {
                location.href = '/admin'
            } else {
                crear_toast('Combinacion erronea','El usuario ya existe.')
            }
        })
    }
}

function crear_toast(titulo, texto){
    $.toast({
        text: texto,
        title: titulo,
        icon: "error",
        position: "top-right",
        hideAfter: 8000
    })
}
