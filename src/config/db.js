const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("ticketplus", "ticketuser", "ticketpass", {
	host: "localhost",
	port: 3307,
	dialect: "mysql",
	logging: false,
});

module.exports = sequelize;
