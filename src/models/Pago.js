const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Pago = sequelize.define(
  "Pago",
  {
    id_pago: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    costo_servicio: DataTypes.DECIMAL,
    monto_total: DataTypes.DECIMAL,
    fecha_pago: DataTypes.DATE,
    estado: DataTypes.STRING,
    id_descuento: DataTypes.INTEGER,
    id_metodo_pago: DataTypes.INTEGER,
  },
  {
    tableName: "pago",
    timestamps: false,
  }
);

module.exports = Pago;
