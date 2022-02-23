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
      type: DataTypes.TEXT,
      allowNull: true,  
    },
    theme:{
      type: DataTypes.BOOLEAN,
      allowNull: false,
    }
    /*
    mobile: {
        type: DataTypes.STRING,
    },*/
  });
};
