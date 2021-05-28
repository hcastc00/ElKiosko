const express = require("express");
const application = express();

application.use(express.static("public"));

application.listen(80, () => {
  console.log("El Kiosko ha abierto! 😈");
});