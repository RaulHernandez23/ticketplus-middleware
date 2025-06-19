const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const RecuperacionContrasena = sequelize.define(
    "RecuperacionContrasena",
    {
        id_recuperacion: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        id_usuario: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        token: {
            type: DataTypes.STRING(6),
            allowNull: false,
        },
        fecha_expiracion: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        estado: {
            type: DataTypes.ENUM("activo", "inactivo"),
            allowNull: false,
            defaultValue: "activo",
        }
    },
    {
        tableName: "recuperacion_contrasena",
        timestamps: false,
    }
)

module.exports = RecuperacionContrasena;