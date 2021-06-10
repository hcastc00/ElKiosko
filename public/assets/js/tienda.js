
function comprarAlbum(){

    //TODO mirar como sacar desde el ejs el id de cada album, el precio ya
    let idAlbum = 37;
    let precioAlbum = document.getElementById('precioAlbum_albumQueSea').innerText;
    console.log(precioAlbum)
    
    $.post('/socio/comprarAlbum', {album: {id: idAlbum, precio: precioAlbum}})
        .done(function(result){
            console.log(result)
            alert('ALBUM VENDIDO SATISFACTORIAMENTE')
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
            }            
        })
}