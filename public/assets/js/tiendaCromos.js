function comprarCromo(event){
    let id = event.target.id.split('_')[1]
    let ruta = event.target.id.split('_')[2]
    let coleccion = event.target.id.split('_')[3]
    console.log(id)
    let precio = document.getElementById("precio_"+id).innerText;
    console.log(precio)

    $.post('/socio/comprarCromo', {cromo: {id: id, ruta: ruta, precio: precio, coleccion: coleccion} })
        .done(function(result){
            console.log(result)
            alert('CROMO VENDIDO SATISFACTORIAMENTE')
            location.reload()
        })

        .fail(function(xhr, status, error){
            console.log(xhr.responseText)
            switch(xhr.responseText){
                case 'Ya_Comprado':
                    $("#yaComprado").modal("toggle");
                    break;
                case 'Sin_Saldo':
                    $("#sinSaldo").modal("toggle");
                    break;
                case 'Sin_Album':
                    $("#sinAlbum").modal("toggle");
                    break;    
            }            
        })
}