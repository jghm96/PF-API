const { Router } = require('express');
const { Transaction, Symbol, User } = require("../db");
const transactions = Router();
const isAuthenticated = require("../Authenticated");

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
                attributes: ["symbol"]
            }
        });
        var h = {};
        // All transactions
        h.allTransactions = results.map(t => {
            return {
                'id': t.id,
                'amount': t.deposit !== 0 ? t.deposit : -t.withdraw,
                'symbol': t.symbol.symbol
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

        res.json(h); // Esto es un objeto con dos elementos:
        // All transactions podria servir para hacer un movimientos historicos de la cuenta
        // Historical by Symbol podria servir para mostrar el rendimiento en un simbolo en particular.
    } catch {
        res.status(404).json({ 'message': 'Something was wrong.' });
    }
});

transactions.get("/current-balance", isAuthenticated, async (req, res) => { // Permite ver el estado de la cuenta, saldo actual.

    try {
        const userId = req.user.id;
        const results = Transaction.findAll({
            where: { userId },
            attributes: ["id", "deposit", "withdraw"],
            include: {
                model: Symbol,
                attributes: ["symbol"]
            }
        });
        // All transactions
        var allTransactions = results.map(t => {
            return {
                'id': t.id,
                'amount': t.deposit !== 0 ? t.deposit : -t.withdraw,
                'symbol': t.symbol.symbol
            }
        })
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
        keys.forEach(k => {
            currentBalance = {
                ...currentBalance,
                [k]: historicalBySymbol[k].reduce((a, b) => a + b, 0)
            }
        });
        res.json(currentBalance); // Esto es un objeto con un elementos:
        // Current Balance da cuenta del estado actual de la cuenta bajo todos los simbolos disponibles en la wallet.
    } catch {
        res.status(404).json({ 'message': 'Something was wrong.' });
    }
});

module.exports = transactions;