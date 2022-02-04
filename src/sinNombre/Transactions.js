const {Transaction,Symbol,User} = require("../db");

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

module.exports = getAllTransactions;