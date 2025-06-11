const validarLogin = (req, res, next) => {
	const { correo, contraseña } = req.body;

	if (!correo || !contraseña)
		return res
			.status(400)
			.json({ mensaje: "Correo y contraseña son obligatorios" });

	const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!regexCorreo.test(correo))
		return res.status(400).json({ mensaje: "Formato de correo inválido" });

	next();
};

module.exports = {
	validarLogin,
};
