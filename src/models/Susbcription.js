const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  
  sequelize.define('susbcription', {
    alertOnRise:{
        type: DataTypes.BOOLEAN,
        default:false,
    },
    risePrice:{
        type: DataTypes.INTEGER,
        allowNull:false,
    },
    alertOnFall:{
        type: DataTypes.BOOLEAN,
        default:false,
    },
    fallPrice:{
        type: DataTypes.INTEGER,
        allowNull:false,
    }
    
  });
};
