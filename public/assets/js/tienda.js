
function comprarAlbum(event){

    let idAlbum = event.target.id.split('_')[1];
    let coleccion = event.target.id.split('_')[2];
    let identificadorPrecio = 'precioAlbum_' + idAlbum;
    let precioAlbum = document.getElementById(identificadorPrecio).innerText;
    
    $.post('/socio/comprarAlbum', {album: {id: idAlbum, precio: precioAlbum}})
        .done(function(result){
            $.toast({
                text: 'El album de la colección '+ coleccion + ' se ha añadido a su inventario correctamente',
                title: 'VENDIDO',
                icon: "success",
                position: "top-right",
                hideAfter: 8000               
            })
        })

        .fail(function(xhr, status, error){
            switch(xhr.responseText){
                case 'Ya_Comprado':
                    $.toast({
                        text: 'Ya tiene el álbum de ' + coleccion + ' en su inventario',
                        title: 'REPETIDO',
                        icon: "error",
                        position: "top-right",
                        hideAfter: 8000               
                    })
                    break;
                case 'Sin_Saldo':
                    $.toast({
                        text: 'No tiene saldo suficiente para comprar el álbum de ' + coleccion,
                        title: 'BANCARROTA',
                        icon: "error",
                        position: "top-right",
                        hideAfter: 8000               
                    })
                    break;
            }            
        })
}

