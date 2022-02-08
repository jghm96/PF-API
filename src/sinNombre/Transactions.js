const {Transaction,Symbol,User} = require("../db");
const sequelize = require('sequelize');

const addTransaction = async (userId,amount,crypto,type) => {
    let amountSign = type === "deposit"? amount : -amount;
    let symbol = await Symbol.findOne({where:{symbol:crypto}});
    let transaction = await Transaction.create({type,amount:amountSign});
    let user = await User.findByPk(userId);
    symbol.addTransaction(transaction);
    user.addTransaction(transaction);
}

const getAllTransactions = async (userId) => {
  return await Transaction.findAll({
      where:{ userId},
      attributes:["id","type","amount"],
      include:{
          model:Symbol,
          attributes:["symbol"]
      }
  })
}

const getCryptosForUser = async (userId) => {
    try{
    return await Transaction.findAll({
        group: ["symbolId"],
        where:{
           userId
        },
        attributes: ["symbolId",
          [sequelize.fn('sum', sequelize.col('amount')), 'total_amount'],
        ],
        raw: true,        
      });}catch(e){
          return e;
      }
}

module.exports = {addTransaction,getAllTransactions,getCryptosForUser};