function comprarCromo(id, ruta, coleccion){
    //let id = event.target.id.split('_')[1]
    //let ruta = event.target.id.split('_')[2]
    //let coleccion = event.target.id.split('_')[3]
    let precio = document.getElementById("precio_"+id).innerText;
    console.log(precio)

    $.post('/socio/comprarCromo', {cromo: {id: id, ruta: ruta, precio: precio, coleccion: coleccion} })
        .done(function(result){
            console.log(result)
            $.toast({
                text: 'Vendido!',
                title: 'VENDIDO',
                icon: "success",
                position: "top-right",
                hideAfter: 6000         
            })

            if(result.agotada){
                $.toast({
                    text: 'Ya no quedan cromos!',
                    title: 'Sin cromos',
                    icon: "error",
                    position: "top-right",
                    hideAfter: 6000
                })
            }
            sleep(2500).then(() => {  location.reload(); });
        })

        .fail(function(xhr, status, error){
            console.log(xhr.responseText)
            switch(xhr.responseText){
                case 'Ya_Comprado':
                    $.toast({
                        text: 'Ya tiene el cromo en su inventario',
                        title: 'REPETIDO',
                        icon: "error",
                        position: "top-right",
                        hideAfter: 8000               
                    })
                    break;
                case 'Sin_Saldo':
                    $.toast({
                        text: 'No tiene saldo suficiente para comprar el cromo',
                        title: 'BANCARROTA',
                        icon: "error",
                        position: "top-right",
                        hideAfter: 8000               
                    })
                    break;
                case 'Sin_Album':
                    $.toast({
                        text: 'No tiene el álbum de la colección ' + coleccion + ', por lo que no puede comprar sus cromos.',
                        title: 'BANCARROTA',
                        icon: "error",
                        position: "top-right",
                        hideAfter: 8000               
                    })
                    break;    
            }            
        })

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}