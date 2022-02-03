const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
 
  sequelize.define('pair', {
    /*idSymbol1:{
      type: DataTypes.INTEGER,
      allowNull:false,
      primaryKey:true
    },
    idSymbol2:{
      type: DataTypes.INTEGER,
      allowNull:false,
      primaryKey:true
    }, */
    price: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    pair: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
};
