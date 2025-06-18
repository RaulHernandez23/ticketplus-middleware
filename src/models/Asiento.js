const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Zona = require("./Zona");

const Asiento = sequelize.define(
  "Asiento",
  {
    id_asiento: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    numero: DataTypes.INTEGER,
    fila: DataTypes.STRING,
    id_zona: DataTypes.INTEGER,
  },
  {
    tableName: "asiento",
    timestamps: false,
  }
);

// Asociación
Asiento.belongsTo(Zona, { foreignKey: "id_zona" });

module.exports = Asiento;
