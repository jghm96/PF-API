const { DataTypes } = require('sequelize');
// Exportamos una funcion que define el modelo
// Luego le injectamos la conexion a sequelize.
module.exports = (sequelize) => {
  // defino el modelo holasssssss
  // comentario
  sequelize.define('transaction', {
    type:{
        type: DataTypes.ENUM(["deposit","withdraw"]),
        allowNull: false,
    },
    amount:{
      type: DataTypes.INTEGER,
      defaultValue:0
  },
    
  });
};
