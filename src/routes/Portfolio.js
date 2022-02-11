const portfolio = require('express').Router()
const { Transaction, Symbol } = require('../db')
const { isAuthenticated } = require('../JWT/JSONWT')
const axios = require('axios')

portfolio.get("/", isAuthenticated, async (req, res) => { // Permite ver el estado de la cuenta, saldo actual.

    try {
        console.log(req.user.id)
        const userId = req.user.id;
        const results = await Transaction.findAll({
            where: { userId },
            attributes: ["id", "deposit", "withdraw"],
            include: {
                model: Symbol,
                attributes: ["symbol", 'image']
            }
        });
        console.log(results)
        if (results.length === 0) {
            res.status(404).json({ errorType: 'errorTransactions', errorCode: '1520', errorMessage: 'There are not transactions yet.' })
        } else {
            const pairs = (await axios.get('https://api.binance.com/api/v3/ticker/price')).data;
            // All transactions
            var allTransactions = results.map(t => {
                return {
                    'id': t.id,
                    'amount': t.deposit !== 0 ? t.deposit : -t.withdraw,
                    'symbol': t.symbol.symbol,
                    'image': t.symbol.image
                }
            });
            // handle images
            var images = {};
            allTransactions.forEach(t => {
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
            //let usdtToBtc = 1 / ((pairs.filter(p => p.symbol === 'BTCUSDT'))[0].price)
            keys.forEach(k => {
                currentBalance = {
                    ...currentBalance,
                    [k]: {
                        'balance': historicalBySymbol[k].reduce((a, b) => a + b, 0),
                        'image': images[k],
                                            }
                }
            });
            // Converting to an array so everyone is happy
            var arrayOfHappiness = [];
            keys.forEach(k => {
                arrayOfHappiness.push(
                    {
                        ...currentBalance[k],
                        'symbol': k,
                    }
                )
            })
            res.json(arrayOfHappiness);
        }
        // Current Balance da cuenta del estado actual de la cuenta bajo todos los simbolos disponibles en la wallet.
    } catch {
        res.status(500).json({ 'message': 'Something was wrong.' });
    }
});

module.exports = portfolio
