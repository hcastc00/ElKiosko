const express = require("express");
const application = express();

const fs = require("fs");
//const fs = fs();


// Parse URL-encoded bodies (as sent by HTML forms)
application.use(express.urlencoded());


// Parse JSON bodies (as sent by API clients)
application.use(express.json());

// Configurar cabeceras y cors
application.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST');
    next();
});

application.use(express.static("public"));

application.listen(80, () => {
  console.log("El Kiosko ha abierto! 😈 Escuchando en http://localhost:80");
});


// Post para recibir imagenes introducidas por el admin
application.post('/images', function(request, response){
    //TODO no coge bien lo que manda el cliente
    const filePath = request.body.file;
    //TODO esto da uhndefined ni idea de por que
    console.log(request.body.file);
    //Express middleware gives a temporary name to the file, so we rename it.
    fs.rename(filePath, "./" + filePath, function(err){
        if(err){
            response.send('Error' , err);
        }
        console.log("file uploaded. Extradata: tag = #{req.body.tag}");
        response.send('Success');
    });
});

    