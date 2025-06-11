const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("nombre_basedatos", "usuario", "contraseña", {
	host: "localhost",
	dialect: "mysql", // o 'postgres'
	logging: false,
});

module.exports = sequelize;
