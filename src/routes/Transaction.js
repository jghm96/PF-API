const { Router } = require('express');
const { Transaction, Symbol, User } = require("../db");
const transactions = Router();
const isAuthenticated = require("../Authenticated");
const { axios } = require('axios');

transactions.post("/buy", isAuthenticated, async (req, res) => { // Permite crear una nueva transaccion

    try {
        const { symbol, deposit, whitdraw } = req.params;

        let amountAndType = await Transaction.create({ deposit: deposit, withdraw: whitdraw });

        let purchasedSymbol = await Symbol.findOne({ where: { symbol: symbol } });
        let buyer = await User.findByPk(req.user.id);

        purchasedSymbol.addTransaction(amountAndType);
        buyer.addTransaction(amountAndType);

        res.json({ message: "Transaction completed successfully." });
    } catch {
        res.status(404).json({ 'message': 'Something was wrong.' });
    }
});

transactions.get("/state-account", isAuthenticated, async (req, res) => { // Permite ver el estado de la cuenta, movmientos y rendimientos.
    try {
        const userId = req.user.id;
        const results = Transaction.findAll({
            where: { userId },
            attributes: ["id", "deposit", "withdraw"],
            include: {
                model: Symbol,
                attributes: ["symbol",'image'],
            }
        });
        // All transactions
        var h = results.map(t => {
            return {
                'id': t.id,
                'amount': t.deposit !== 0 ? t.deposit : -t.withdraw,
                'symbol': t.symbol.symbol,
                'image':t.symbol.image
            }
        })
        res.json(h);
        // All transactions podria servir para hacer un movimientos historicos de la cuenta
    } catch {
        res.status(404).json({ 'message': 'Something was wrong.' });
    }
});

transactions.get("/current-balance", isAuthenticated, async (req, res) => { // Permite ver el estado de la cuenta, saldo actual.

    try {
        const userId = req.user.id;
        const results = await Transaction.findAll({
            where: { userId },
            attributes: ["id", "deposit", "withdraw"],
            include: {
                model: Symbol,
                attributes: ["symbol",'image']
            }
        });
        const pairs = (await axios('https://api.binance.com/api/v3/ticker/price')).data;
        // All transactions
        var allTransactions = results.map(t => {
            return {
                'id': t.id,
                'amount': t.deposit !== 0 ? t.deposit : -t.withdraw,
                'symbol': t.symbol.symbol,
                'image':t.symbol.image
            }
        });
        // handle images
        var images = {};
        h.allTransactions.forEach(t => {
            images = {
                ...images,
                [t.symbol]: t.image 
            }
        });
        // Historical by symbol
        var historicalBySymbol = {};
        allTransactions.forEach(t => {
            historicalBySymbol = {
                ...historicalBySymbol,
                [t.symbol]: historicalBySymbol[t.symbol] ? [...historicalBySymbol[t.symbol], t.amount] : [t.amount]
            }
        });
        // current balance
        var currentBalance = {}
        let keys = Object.keys(historicalBySymbol);
        let usdtToBtc=1/((pairs.filter(p=>p.symbol==='BTCUSDT'))[0].price)
        keys.forEach(k => {
            currentBalance = {
                ...currentBalance,
                [k]: {
                    'balance':historicalBySymbol[k].reduce((a, b) => a + b, 0),
                    'image':images[k],
                    'inUsdt':k==='usdt'?historicalBySymbol[k].reduce((a, b) => a + b, 0):(pairs.filter(p=>p.symbol===inUsdt))[0]?(pairs.filter(p=>p.symbol===inUsdt))[0].price*historicalBySymbol[k].reduce((a, b) => a + b, 0):'',
                    'inBtc':k==='usdt'?(historicalBySymbol[k].reduce((a, b) => a + b, 0))*usdtToBtc:(pairs.filter(p=>p.symbol===inUsdt))[0]?((pairs.filter(p=>p.symbol===inUsdt))[0].price)*usdtToBtc*historicalBySymbol[k].reduce((a, b) => a + b, 0):'',
                }
            }
        });
        // Converting to an array so everyone is happy
        var arrayOfHappiness = [];
        keys.forEach(k=>{
            arrayOfHappiness.push(
                {
                    ...currentBalance[k],
                    'symbol':k,
                }
            )
        })
        res.json(arrayOfHappiness); 
        // Current Balance da cuenta del estado actual de la cuenta bajo todos los simbolos disponibles en la wallet.
    } catch {
        res.status(404).json({ 'message': 'Something was wrong.' });
    }
});

module.exports = transactions;