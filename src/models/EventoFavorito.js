const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); 

const EventoFavorito = sequelize.define('Favorito', {
  id_evento_favorito: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  id_evento: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'evento_favorito',
  timestamps: false,
});

module.exports = EventoFavorito;