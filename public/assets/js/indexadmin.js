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