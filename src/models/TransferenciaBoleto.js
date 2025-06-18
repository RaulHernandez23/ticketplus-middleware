const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const TransferenciaBoleto = sequelize.define(
  "TransferenciaBoleto",
  {
    id_transferencia: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_boleto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    id_usuario_origen: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_usuario_destino: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fecha_transferencia: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    tipo_transferencia: {
      type: DataTypes.ENUM("venta", "regalo"),
      allowNull: false,
    },
  },
  {
    tableName: "transferencia_boleto",
    timestamps: false,
  }
);

module.exports = TransferenciaBoleto;
