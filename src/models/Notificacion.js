const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); 

const Notificacion = sequelize.define('Notificacion', {
  id_notificacion: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    unique: true,
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  id_funcion: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  tipo_notificacion: {
    type: DataTypes.ENUM('funcion nueva', 'funcion cancelada'),
    allowNull: false,
  },
  mensaje: {
    type: DataTypes.STRING(510),
    allowNull: false,
  },
  enviada: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  fecha_envio: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'notificacion',
  timestamps: false, 
});

module.exports = Notificacion;