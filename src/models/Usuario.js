const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Usuario = sequelize.define(
	"Usuario",
	{
        id_usuario: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            unique: true,
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        apellido_paterno: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        apellido_materno: {
            type: DataTypes.STRING,
            allowNull: true,
        },
		correo: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		contrasena: {
			type: DataTypes.STRING,
			allowNull: false,
		},
        fecha_registro: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        estado: {
            type: DataTypes.ENUM("activo", "inactivo"),
            allowNull: false,
        },
        codigo_postal: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        id_pais: {
            type: DataTypes.INTEGER,
            allowNull: true,
        }
	},
	{
		tableName: "usuario",
		timestamps: false,
	}
);

module.exports = Usuario;
