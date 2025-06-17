const express = require("express");
const router = express.Router();
const { login } = require("../controllers/auth.controller");
const { validarLogin  } = require("../middlewares/validateLogin");
const { logout } = require("../controllers/auth.controller");
const { validarToken } = require("../middlewares/validateToken");

router.post("/login", validarLogin, login);
router.post("/logout", [validarToken], logout);

module.exports = router;
