const express = require("express");
const router = express.Router();
const { login } = require("../controllers/auth.controller");
const { validarLogin  } = require("../middlewares/validateLogin");

router.post("/login", validarLogin, login);

module.exports = router;
