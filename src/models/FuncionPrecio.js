const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Evento = require("./Evento");

const FuncionPrecio = sequelize.define(
  "FuncionPrecio",
  {
    id_funcion_precio: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_funcion: DataTypes.INTEGER,
    id_zona: DataTypes.INTEGER,
    precio: DataTypes.DECIMAL,
  },
  {
    tableName: "funcion_precio",
    timestamps: false,
  }
);

module.exports = FuncionPrecio;
