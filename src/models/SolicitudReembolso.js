const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const SolicitudReembolso = sequelize.define(
  "SolicitudReembolso",
  {
    id_solicitud: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_boleto: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    motivo: {
      type: DataTypes.STRING(510),
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM("pendiente", "aceptado", "rechazado"),
      allowNull: false,
    },
  },
  {
    tableName: "solicitud_reembolso",
    timestamps: false,
  }
);

module.exports = SolicitudReembolso;
