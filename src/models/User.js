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
    image: {
      type: DataTypes.STRING,
      allowNull: true,  
    },
    theme:{
      type: DataTypes.ENUM('dark','light'),
      allowNull: true,
    }
    /*
    mobile: {
        type: DataTypes.STRING,
    },*/
  });
};
