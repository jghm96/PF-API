const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  sequelize.define('errorLog', {
    userId:{
      type: DataTypes.STRING
    },
    Method: {
      type: DataTypes.STRING
    },
    Route: {
      type: DataTypes.STRING
    },
    Body: {
      type: DataTypes.STRING
    },
    errorType: {
      type: DataTypes.STRING
    },
    errorCode: {
      type: DataTypes.STRING
    },
    errorMessage: {
      type: DataTypes.STRING
    }
  })
}
