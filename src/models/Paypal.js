const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const MetodoPago = require("./MetodoPago");

const Paypal = sequelize.define(
  "Paypal",
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
    correo_paypal: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
  },
  {
    tableName: "paypal",
    timestamps: false,
  }
);

module.exports = Paypal;
