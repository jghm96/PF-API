const { Router } = require('express');
const {Transaction,Symbol,User} = require("../db");
const transactions = Router();
const isAuthenticated = require("../Authenticated");

transactions.post("/buy",isAuthenticated,async(req,res) => { // Permite crear una nueva transaccion

    const {symbol,deposit,whitdraw,userId} = req.params;

    let amountAndType = await Transaction.create({deposit:deposit,withdraw:whitdraw});

    let purchasedSymbol = await Symbol.findOne({where:{symbol:symbol}});
    let buyer = await User.findByPk(userId);

    purchasedSymbol.addTransaction(amountAndType);
    buyer.addTransaction(amountAndType);
    
    res.json({message:"Transaction completed successfully."});
});

transactions.get("/state-account",isAuthenticated,async(req,res) => { // Permite ver el estado de la cuenta, saldos, movmientos y rendimientos.
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
    res.json(h); // Esto es un objeto con tres elementos:
                // All transactions podria servir para hacer un movimientos historicos de la cuenta
                // Historical by Symbol podria servir para mostrar el rendimiento en un simbolo en particular.
                // Current Balance da cuenta del estado actual de la cuenta bajo todos los simbolos disponibles en la wallet.
});

module.exports = transactions;