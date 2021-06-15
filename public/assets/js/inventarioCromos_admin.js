function anyadir_copias(coleccion, ruta, album) {
    let copias = document.getElementById(ruta + "_copias").value
    $.post('/admin/inventarioCromos', {coleccion: coleccion, ruta: ruta, album: album, copias: copias}, (res) => {

            if (!res.error) {
                $.toast({
                    text: 'Se han añadido ' + copias + ' copias del cromo.',
                    title: 'Añadido correctamente',
                    icon: "success",
                    position: "top-right",
                    hideAfter: 8000
                })

                let repeticiones = parseInt(document.getElementById("rep_en_bd_"+ruta).innerHTML)
                document.getElementById("rep_en_bd_"+ruta).innerHTML = (repeticiones + parseInt(copias)).toString();
                document.getElementById(ruta + "_copias").value = ""
            }
    })

}