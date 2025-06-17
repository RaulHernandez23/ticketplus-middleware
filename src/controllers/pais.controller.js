const Pais = require("../models/Pais");
const { Op } = require("sequelize");

const obtenerPaises = async (req, res) => {
    try {
        const paises = await Pais.findAll({
            attributes: ["id_pais", "pais", "codigo_iso_2", "url_bandera"],
            order: [["pais", "ASC"]],
        });
        return res.status(200).json(paises);
    } catch (error) {
        console.error("Error al obtener los países:", error);
        return res.status(500).json({ mensaje: "Error interno del servidor." });
    }
}

module.exports = {
    obtenerPaises,
};