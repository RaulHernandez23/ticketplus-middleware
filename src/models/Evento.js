const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Evento = sequelize.define(
  "Evento",
  {
    id_evento: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    titulo: DataTypes.STRING,
    banner_url: DataTypes.STRING,
    id_artista: DataTypes.INTEGER,
    id_categoria: DataTypes.INTEGER,
  },
  {
    tableName: "evento",
    timestamps: false,
  }
);

module.exports = Evento;
