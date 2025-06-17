const jwt = require("jsonwebtoken");

const { SECRET_KEY } = require("./config");

const generarJWT = (uid = "") => {
	return new Promise((resolve, reject) => {
		const payload = { uid };
		jwt.sign(payload, SECRET_KEY, { expiresIn: "2h" }, (err, token) => {
			if (err) {
				reject("No se pudo generar token");
			} else {
				resolve(token);
			}
		});
	});
};

module.exports = {
	generarJWT,
};
