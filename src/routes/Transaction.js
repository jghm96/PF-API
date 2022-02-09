const { Router } = require('express');
const {Transaction,Symbol,User} = require("../db");
const transactions = Router();
const isAuthenticated = require("../Authenticated");

transactions.post("/buy",isAuthenticated,async(req,res) => {

    const {symbol,deposit,whitdraw,userId} = req.params;

    let amountAndType = await Transaction.create({deposit:deposit,withdraw:whitdraw});

    let purchasedSymbol = await Symbol.findOne({where:{symbol:symbol}});
    let buyer = await User.findByPk(userId);

    purchasedSymbol.addTransaction(amountAndType);
    buyer.addTransaction(amountAndType);
    
    res.json({message:"Transaction completed successfully."});
});

transactions.get("/state-account",isAuthenticated,async(req,res) => {
    const {userId} = req.params;
    const results = Transaction.findAll({
        where:{ userId},
        attributes:["id","deposit","withdraw"],
        include:{
            model:Symbol,
            attributes:["symbol"]
        }
    });
    var h={};
    // All transactions
    h.allTransactions = results.map(t=>{
        return{
            'id':t.id,
            'amount':t.deposit!==0?t.deposit:-t.withdraw,
            'symbol':t.symbol.symbol
        }
    })
    // Historical by symbol
    var historicalBySymbol = {};
    h.allTransactions.forEach(t => {
        historicalBySymbol = {
            ...historicalBySymbol,
            [t.symbol]: historicalBySymbol[t.symbol] ? [...historicalBySymbol[t.symbol], t.amount] : [t.amount]
        }
    });
    h.historicalBySymbol = historicalBySymbol;
    // current balance
    var currentBalance = {}
    let keys = Object.keys(historicalBySymbol);
    keys.forEach(k => {
        currentBalance = {
            ...currentBalance,
            [k] : historicalBySymbol[k].reduce((a, b) => a + b, 0)
        }
    });
    h.currentBalance = currentBalance;
    res.json(h);
});

module.exports = transactions;