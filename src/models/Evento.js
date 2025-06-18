const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Evento = sequelize.define(
  "Evento",
  {
    id_evento: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    titulo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    descripcion: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    banner_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    id_artista: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_categoria: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "evento",
    timestamps: false,
  }
);

module.exports = Evento;