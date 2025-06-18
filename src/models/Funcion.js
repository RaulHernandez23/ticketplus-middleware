const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Funcion = sequelize.define(
  "Funcion",
  {
    id_funcion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_evento: DataTypes.INTEGER,
    fecha: DataTypes.DATE,
    id_recinto: DataTypes.INTEGER,
    fecha_inicio_venta: DataTypes.DATE,
    fecha_fin_venta: DataTypes.DATE,
    disponibilidad: DataTypes.BOOLEAN,
  },
  {
    tableName: "funcion",
    timestamps: false,
  }
);

module.exports = Funcion;
