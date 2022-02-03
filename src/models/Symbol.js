const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  
  sequelize.define('symbol', {
    symbol: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
};
