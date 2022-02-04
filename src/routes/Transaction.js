const { Router } = require('express');
const {Transaction,Symbol,User} = require("../db");
const transactions = Router();
const isAuthenticated = require("../Authenticated");

transactions.get("/buy",isAuthenticated,async(req,res) => {

    const {symbol,deposit,whitdraw,userId} = req.params;

    let amountAndType = await Transaction.create({deposit:deposit,withdraw:whitdraw});

    let purchasedSymbol = await Symbol.findOne({where:{symbol:symbol}});
    let buyer = await User.findByPk(userId);

    purchasedSymbol.addTransaction(amountAndType);
    buyer.addTransaction(amountAndType);
    
    res.json({message:"Transaction completed successfully."});
});


module.exports = transactions;