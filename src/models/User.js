const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  
  sequelize.define('user', {
    id:{
        type: DataTypes.STRING,
        allowNull:false,
        primaryKey:true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    balance: {
      type: DataTypes.INTEGER,
     allowNull: false,
    },
    userType: {
      type: DataTypes.STRING,
    },
    mobile: {
        type: DataTypes.STRING,
    },
  });
};
