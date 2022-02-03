const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('order', {
    buyOrder:{
        type: DataTypes.STRING,
        default:Date.now
    },
    amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    marketOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    priceLimit: {
      type: DataTypes.INTEGER,
      allowNull:false
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull:false,
    },
    confirmationRequeried: {
      type: DataTypes.BOOLEAN,
      allowNull:false,
    },
    /*sendOn: {
      type: DataTypes.BOOLEAN,
      allowNull:false,
    },*/
    
  });
};