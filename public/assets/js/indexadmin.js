function duplicarCromos(){

    $.get('/admin/colecciones_creadas', function (res){
        console.log(res)
        if(res == 'No hay colecciones'){
            $.toast({
                text: 'No hay colecciones asociadas',
                title: 'No hay colecciones',
                icon: "error",
                position: "top-right",
                hideAfter: 8000
            })
        }else{
            location.href = '/admin/colecciones_creadas'
        }
    })
}


const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const creada = urlParams.get('coleccionCreada')
if (creada) {
    $(document).ready(function () {
        $.toast({
            text: 'La colección se ha creado satisfactoriamente',
            title: 'CREADA',
            icon: "success",
            position: "top-right",
            hideAfter: 8000
        })
    })
}