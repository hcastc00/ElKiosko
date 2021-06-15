function submitForm() {
    let numberOfFiles = getNumberOfFiles();
    let nombreColeccion = document.getElementById("nombreColeccion").value;
    if (numberOfFiles < 10) {
        notify_msg('Porfavor, introduzca al menos 10 imágenes para crear una colección.');
    } else if (nombreColeccion == "") {
        notify_msg('Porfavor, introduzca el nombre de la colección.');
    } else {

        document.getElementById("gifCargando").style.display = "inline";

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
                if (res.status === 500){

                    document.getElementById("gifCargando").style.display = "none";

                    $.toast({
                        text: 'El nombre de coleccion introducido ya esta utilizado',
                        title: 'Coleccion repetida',
                        icon: "error",
                        position: "top-right",
                        hideAfter: 8000
                    })
                }else{
                    $.get(dir);
                    location.href = dir;
                }
            })
            .catch((err) => ("Error occured", err));
    }
}