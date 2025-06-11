const crypto = require("crypto");

const SECRET_KEY = crypto.randomBytes(32).toString("hex");

module.exports = {
	SECRET_KEY,
};
