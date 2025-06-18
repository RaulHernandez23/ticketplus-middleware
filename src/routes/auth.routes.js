const express = require("express");
const router = express.Router();
const { login } = require("../controllers/auth.controller");
const { validarLogin  } = require("../middlewares/validateLogin");
const { logout } = require("../controllers/auth.controller");
const { validarToken } = require("../middlewares/validateToken");
const { recuperarContraseña } = require("../controllers/auth.controller");
const { verificarCodigoRecuperacion } = require("../controllers/auth.controller");

router.post("/login", validarLogin, login);
router.post("/logout", [validarToken], logout);
router.post("/recuperar-contrasena", recuperarContraseña);
router.post("/verificar-codigo", verificarCodigoRecuperacion);

module.exports = router;
