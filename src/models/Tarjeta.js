const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const MetodoPago = require("./MetodoPago");

const Tarjeta = sequelize.define(
  "Tarjeta",
  {
    id_metodo_pago: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      references: {
        model: MetodoPago,
        key: "id_metodo_pago",
      },
    },
    numero_tarjeta_cifrado: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    titular_tarjeta: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    vencimiento_mes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isNumeric: true,
        min: 1,
        max: 12,
      },
    },
    vencimiento_ano: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isNumeric: true,
        min: new Date().getFullYear(),
      },
    },
    ultimos_cuatro: {
      type: DataTypes.STRING(4),
      allowNull: false,
      validate: {
        isNumeric: true,
        len: [4, 4],
      },
    },
  },
  {
    tableName: "tarjeta",
    timestamps: false,
  }
);

module.exports = Tarjeta;
