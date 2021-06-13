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

                document.getElementById("rep_en_bd").innerHTML = copias + document.getElementById("rep_en_bd").innerHTML
            }
    })

}