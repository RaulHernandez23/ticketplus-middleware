const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Funcion = require("./Funcion");
const Zona = require("./Zona");

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

FuncionPrecio.belongsTo(Funcion, { foreignKey: "id_funcion" });
FuncionPrecio.belongsTo(Zona, { foreignKey: "id_zona" });

module.exports = FuncionPrecio;
