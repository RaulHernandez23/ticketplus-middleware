const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); 
    
const ValoracionEvento = sequelize.define("ValoracionEvento", {
    id_valoracion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      unique: true
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_evento: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    calificacion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    comentario: {
      type: DataTypes.STRING(510),
      allowNull: true
    }
  }, {
    tableName: "valoracion_evento",
    timestamps: false
  }
);

module.exports = ValoracionEvento;