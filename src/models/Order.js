const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('order', {
    buyOrder:{
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    amount: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
    marketOrder: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    priceLimit: {
      type: DataTypes.DOUBLE,
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
    sendOnPending: {
      type: DataTypes.BOOLEAN,
      allowNull:false,
    },
    sendOnFullfiled: {
      type: DataTypes.BOOLEAN,
      allowNull:false,
    },
    sendOnCanceled: {
      type: DataTypes.BOOLEAN,
      allowNull:false,
    },

  });
};
