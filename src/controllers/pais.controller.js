const fs = require("fs");
const path = require("path");
const Pais = require("../models/Pais");

const obtenerPaises = async (req, res) => {
	try {
		const paises = await Pais.findAll({
			attributes: ["id_pais", "pais", "codigo_iso_2", "url_bandera"],
			order: [["pais", "ASC"]],
		});

		const paisesConBandera = paises.map((pais) => {
			try {
				const rutaBandera = path.join(
					__dirname,
					"..",
                    "..",
					"public",
					pais.url_bandera
				);
				const ext = path.extname(pais.url_bandera).slice(1); // 'png', 'svg', etc.
				const imagen = fs.readFileSync(rutaBandera);
				const base64 = imagen.toString("base64");
				return {
					id_pais: pais.id_pais,
					pais: pais.pais,
					codigo_iso_2: pais.codigo_iso_2,
					bandera_base64: `data:image/${ext};base64,${base64}`,
				};
			} catch (err) {
				console.error(
					`No se pudo cargar la bandera para ${pais.pais}:`,
					err
				);
				return {
					id_pais: pais.id_pais,
					pais: pais.pais,
					codigo_iso_2: pais.codigo_iso_2,
					bandera_base64: null,
				};
			}
		});

		return res.status(200).json(paisesConBandera);
	} catch (error) {
		console.error("Error al obtener los países:", error);
		return res.status(500).json({ mensaje: "Error interno del servidor." });
	}
};

const obtenerPaisesPorId = async (req, res) => {
	try {
		const { id } = req.params;
		const pais = await Pais.findByPk(id, {
			attributes: ["id_pais", "pais", "codigo_iso_2", "url_bandera"],
		});

		if (!pais) {
			return res.status(404).json({ mensaje: "País no encontrado." });
		}

		try {
			const rutaBandera = path.join(
				__dirname,
				"..",
				"..",
				"public",
				pais.url_bandera
			);
			const ext = path.extname(pais.url_bandera).slice(1); // 'png', 'svg', etc.
			const imagen = fs.readFileSync(rutaBandera);
			const base64 = imagen.toString("base64");
			pais.bandera_base64 = `data:image/${ext};base64,${base64}`;
		} catch (err) {
			console.error(`No se pudo cargar la bandera para ${pais.pais}:`, err);
			pais.bandera_base64 = null;
		}

		return res.status(200).json(pais);
	} catch (error) {
		console.error("Error al obtener el país:", error);
		return res.status(500).json({ mensaje: "Error interno del servidor." });
	}
}

module.exports = {
	obtenerPaises,
	obtenerPaisesPorId
};
