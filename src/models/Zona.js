const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Zona = sequelize.define(
  "Zona",
  {
    id_zona: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: DataTypes.STRING,
  },
  {
    tableName: "zona",
    timestamps: false,
  }
);

module.exports = Zona;
