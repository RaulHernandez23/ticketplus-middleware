const Usuario = require("../models/Usuario");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");

const registrarUsuario = async (req, res) => {
  try {
    const {
      nombre,
      apellido_paterno,
      apellido_materno,
      correo,
      contrasena,
      confirmar_contrasena,
      codigo_postal,
      id_pais,
    } = req.body;

    if (
      !nombre ||
      !apellido_paterno ||
      !correo ||
      !contrasena ||
      !confirmar_contrasena ||
      !codigo_postal ||
      !id_pais
    ) {
      return res.status(400).json({
        mensaje: "Todos los campos obligatorios deben estar completos.",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      return res
        .status(400)
        .json({ mensaje: "El correo no tiene un formato válido." });
    }

    if (contrasena !== confirmar_contrasena) {
      return res.status(400).json({ mensaje: "Las contraseñas no coinciden." });
    }

    if (contrasena.length < 8) {
      return res.status(400).json({
        mensaje: "La contraseña debe tener al menos 8 caracteres.",
      });
    }

    const existente = await Usuario.findOne({ where: { correo } });
    if (existente) {
      return res
        .status(409)
        .json({ mensaje: "Este correo ya está registrado." });
    }

    const hash = await bcrypt.hash(contrasena, 10);

    await Usuario.create({
      nombre,
      apellido_paterno,
      apellido_materno,
      correo,
      contrasena: hash,
      codigo_postal,
      id_pais,
      estado: "activo",
      fecha_registro: new Date(),
    });

    return res.status(201).json({ mensaje: "Registro exitoso." });
  } catch (error) {
    console.error("Error en registro:", error);
    return res.status(500).json({
      mensaje: "Ocurrió un error inesperado. Inténtalo más tarde.",
      error: error.message,
    });
  }
};

const actualizarUsuario = async (req, res) => {
  const {
    id_usuario,
    nombre,
    apellido_paterno,
    apellido_materno,
    id_pais,
    codigo_postal,
    correo,
    contraseña_actual,
    nueva_contraseña,
    confirmar_contraseña,
  } = req.body;

  try {
    if (!id_usuario) {
      return res.status(400).json({ mensaje: "ID de usuario requerido" });
    }

    const usuario = await Usuario.findOne({ where: { id_usuario } });

    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    if (!nombre || !apellido_paterno || !id_pais || !codigo_postal) {
      return res.status(400).json({ mensaje: "Faltan campos obligatorios" });
    }

    // Validar correo duplicado (si intenta cambiarlo)
    if (correo && correo !== usuario.correo) {
      const correoExistente = await Usuario.findOne({
        where: {
          correo,
          id_usuario: { [Op.ne]: id_usuario }, // cualquier usuario que NO sea él mismo
        },
      });

      if (correoExistente) {
        return res.status(409).json({
          mensaje: "El correo ya está en uso por otro usuario",
        });
      }

      usuario.correo = correo;
    }

    if (nueva_contraseña || confirmar_contraseña || contraseña_actual) {
      if (!contraseña_actual || !nueva_contraseña || !confirmar_contraseña) {
        return res.status(400).json({
          mensaje: "Todos los campos de contraseña son requeridos",
        });
      }

      if (nueva_contraseña !== confirmar_contraseña) {
        return res
          .status(400)
          .json({ mensaje: "Las nuevas contraseñas no coinciden" });
      }

      const esValida = await bcrypt.compare(
        contraseña_actual,
        usuario.contrasena
      );

      if (!esValida) {
        return res
          .status(400)
          .json({ mensaje: "La contraseña actual es incorrecta" });
      }

      usuario.contrasena = await bcrypt.hash(nueva_contraseña, 10);
    }

    usuario.nombre = nombre;
    usuario.apellido_paterno = apellido_paterno;
    usuario.apellido_materno = apellido_materno;
    usuario.id_pais = id_pais;
    usuario.codigo_postal = codigo_postal;

    await usuario.save();

    return res.status(200).json({ mensaje: "Perfil actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar el perfil:", error);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

const recuperarUsuario = async (req, res) => {
  const { id_usuario } = req.params;

  try {
    if (!id_usuario) {
      return res.status(400).json({ mensaje: "ID de usuario requerido" });
    }

    const usuario = await Usuario.findOne({ where: { id_usuario } });

    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    return res.status(200).json({
      id_usuario: usuario.id_usuario,
      nombre: usuario.nombre,
      apellido_paterno: usuario.apellido_paterno,
      apellido_materno: usuario.apellido_materno,
      correo: usuario.correo,
      codigo_postal: usuario.codigo_postal,
      id_pais: usuario.id_pais,
      estado: usuario.estado,
      fecha_registro: usuario.fecha_registro,
    });
  } catch (error) {
    console.error("Error al recuperar el perfil:", error);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

module.exports = {
  registrarUsuario,
  actualizarUsuario,
  recuperarUsuario,
};
