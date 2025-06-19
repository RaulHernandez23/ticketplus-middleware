const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Usuario = require("./Usuario");
const FuncionPrecio = require("./FuncionPrecio");
const Asiento = require("./Asiento");
const Pago = require("./Pago");
const Funcion = require("./Funcion");

const Boleto = sequelize.define(
  "Boleto",
  {
    id_boleto: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_evento_precio: { type: DataTypes.INTEGER, allowNull: false },
    id_pago: DataTypes.INTEGER,
    id_usuario: { type: DataTypes.INTEGER, allowNull: false },
    fecha_compra: DataTypes.DATE,
    estado: DataTypes.STRING,
    id_asiento: DataTypes.INTEGER,
    id_funcion: DataTypes.INTEGER,
    codigo_qr: DataTypes.STRING,
    url_codigo: DataTypes.STRING,
  },
  {
    tableName: "boleto",
    timestamps: false,
  }
);

// Asociaciones
Boleto.belongsTo(Usuario, { foreignKey: "id_usuario" });
Boleto.belongsTo(FuncionPrecio, { foreignKey: "id_evento_precio" });
Boleto.belongsTo(Asiento, { foreignKey: "id_asiento" });
Boleto.belongsTo(Funcion, { foreignKey: "id_funcion" });
Boleto.belongsTo(Pago, { foreignKey: "id_pago" });

module.exports = Boleto;
