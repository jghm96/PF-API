const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  
  sequelize.define('susbcription', {
    alertOnRise:{
        type: DataTypes.BOOLEAN,
        default:false,
    },
    risePrice:{
        type: DataTypes.DOUBLE,
        allowNull:false,
    },
    alertOnFall:{
        type: DataTypes.BOOLEAN,
        default:false,
    },
    fallPrice:{
        type: DataTypes.DOUBLE,
        allowNull:false,
    }
    
  });
};
