const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Recinto = sequelize.define(
  "Recinto",
  {
    id_recinto: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    calle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    numero: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ciudad: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    estado: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "recinto",
    timestamps: false,
  }
);

module.exports = Recinto;
