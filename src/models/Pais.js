const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Pais = sequelize.define(
    "Pais",
    {
        id_pais: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            unique: true,
        },
        pais: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        codigo_iso_2: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        url_bandera: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        tableName: "pais",
        timestamps: false,
    }
);

module.exports = Pais;