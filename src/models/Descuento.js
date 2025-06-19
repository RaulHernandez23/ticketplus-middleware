const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Descuento = sequelize.define(
	"Descuento",
	{
		id_descuento: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		nombre: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		tipo: {
			type: DataTypes.ENUM("porcentaje", "fijo"),
			allowNull: false,
		},
		valor: {
			type: DataTypes.DECIMAL,
			allowNull: false,
		},
		codigo: {
			type: DataTypes.STRING(6),
			allowNull: false,
		},
		max_usos: {
			type: DataTypes.INTEGER,
			allowNull: true, // NULL = ilimitado
		},
		usos: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0,
		},
		fecha_inicio: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		fecha_fin: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		estado: {
			type: DataTypes.ENUM("activo", "inactivo"),
			allowNull: false,
		},
	},
	{
		tableName: "descuento",
		timestamps: false,
	}
);

module.exports = Descuento;
