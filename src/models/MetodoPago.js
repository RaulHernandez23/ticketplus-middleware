const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Usuario = require("./Usuario");

const MetodoPago = sequelize.define(
  "MetodoPago",
  {
    id_metodo_pago: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    alias: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    fecha_registro: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: "activo",
    },
    tipo_metodo: {
      type: DataTypes.ENUM,
      values: ["paypal", "tarjeta", "criptomoneda"],
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Usuario,
        key: "id_usuario",
      },
    },
  },
  {
    tableName: "metodo_pago",
    timestamps: false,
  }
);

module.exports = MetodoPago;
