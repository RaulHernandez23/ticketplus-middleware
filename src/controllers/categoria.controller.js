const Categoria = require("../models/Categoria")

const obtenerCategorias = async (req, res) => {
	try {
		const categorias = await Categoria.findAll({
			attributes: ["id_categoria", "categoria"],
			order: [["categoria", "ASC"]],
		});
		res.status(200).json(categorias);
	} catch (error) {
		console.error("Error al obtener las categorías:", error);
		res.status(500).json({ mensaje: "Error interno del servidor." });
	}
};

module.exports = {
	obtenerCategorias,
};