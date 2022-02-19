const { Router } = require('express');
const { Transaction, Symbol, User } = require("../db");
const transactions = Router();
const { isAuthenticated } = require("../JWT/JSONWT");
const { axios } = require('axios');

transactions.post("/buy", isAuthenticated, async (req, res) => { // Permite crear una nueva transaccion

    try {
        const { symbolToBuy, symbolToSell, deposit, whitdraw } = req.params;

        // To Sell
        let amountAndType_Sell = await Transaction.create({ deposit: 0, withdraw: whitdraw });

        let purchasedSymbol_Sell = await Symbol.findOne({ where: { symbol: symbolToSell } });
        let sell = await User.findByPk(req.user.id);

        purchasedSymbol_Sell.addTransaction(amountAndType_Sell);
        sell.addTransaction(amountAndType_Sell);


        // To Buy
        let amountAndType = await Transaction.create({ deposit: deposit, withdraw: 0 });

        let purchasedSymbol = await Symbol.findOne({ where: { symbol: symbolToBuy } });
        let buyer = await User.findByPk(req.user.id);

        purchasedSymbol.addTransaction(amountAndType);
        buyer.addTransaction(amountAndType);

        res.json({ message: "Transaction completed successfully." });
    } catch {
        res.status(500).json({ 'message': 'Something was wrong.' });
    }
});

transactions.get("/", isAuthenticated, async (req, res) => { // Permite ver el estado de la cuenta, movmientos y rendimientos.
    try {
        const userId = req.user.id;
        const results = await Transaction.findAll({
            where: { userId },
            attributes: ["id", "deposit", "withdraw",'orderId','updatedAt'],
            include: {
                model: Symbol,
                attributes: ["symbol", 'image'],
            }
        });
        if (!results) {
            return res.json([])
        } else {
            // All transactions
            var h = results.map(t => {
                const date = new Date(t.updatedAt)
                let mes = date.getMonth() + 1 < 10 ? '0'+ ( date.getMonth() + 1) : date.getMonth() + 1 
                let minutes = date.getMinutes().toString().length < 2 ? '0' + date.getMinutes().toString() : date.getMinutes().toString()
                console.log(date.getMinutes())
                return {
                    'id': t.id,
                    'deposit': t.deposit,
                    'withdraw': t.withdraw,
                    'symbol': t.symbol.symbol,
                    'image': t.symbol.image,
                    'orderId': t.orderId,
                    'date': date.getFullYear().toString() + '/'+ mes.toString()+'/' +  date.getDate().toString(),
                    'time': `${date.getHours().toString()}:${minutes}`  
                }
            })
            h = h.length ? (h.sort((a,b) => a.orderId - b.orderId)).reverse() : []
            res.json(h);
        }
        // All transactions podria servir para hacer un movimientos historicos de la cuenta
    } catch {
        res.status(500).json({ 'message': 'Something was wrong.' });
    }
});

module.exports = transactions;
