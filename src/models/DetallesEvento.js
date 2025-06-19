const Evento = require("./Evento");
const Funcion = require("./Funcion");
const Recinto = require("./Recinto");

Evento.hasMany(Funcion, { foreignKey: "id_evento" });
Funcion.belongsTo(Evento, { foreignKey: "id_evento" });

Recinto.hasMany(Funcion, { foreignKey: "id_recinto" });
Funcion.belongsTo(Recinto, { foreignKey: "id_recinto" });

module.exports = {
  Evento,
  Funcion,
  Recinto,
};