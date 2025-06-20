const app = require("./src/app.js");
require("dotenv").config();

const PORT = 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor corriendo en http://0.0.0.0:${PORT}`);
});
