const portfolio = require('express').Router()
const { Transaction, Symbol } = require('../db')
const { isAuthenticated } = require('../JWT/JSONWT')
const axios = require('axios')

portfolio.get("/", isAuthenticated, async (req, res) => { // Permite ver el estado de la cuenta, saldo actual.

    try {
        const userId = req.user.id;
        const results = await Transaction.findAll({
            where: { userId },
            attributes: ["id", "deposit", "withdraw",'symbolId'],
            include: {
                model: Symbol,
                attributes: ["symbol", 'image']
            }
        });
        if (!results) {
            res.status(404).json({ errorType: 'errorTransactions', errorCode: '1520', errorMessage: 'There are not transactions yet.' })
        } else {
            const pairs = (await axios('https://api.binance.com/api/v3/ticker/price')).data;
            // All transactions
            var allTransactions = results.map(t => {
                return {
                    'id': t.id,
                    'amount': t.deposit !== 0 ? t.deposit : -t.withdraw,
                    'symbol': t.symbol.symbol,
                    'image': t.symbol.image,
                    'idSymbol':t.symbolId,
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
            console.log('symbol')
            var symbols = {};
            allTransactions.forEach(t => {
                symbols = {
                    ...symbols,
                    [t.symbol]: t.idSymbol
                }
            });
            console.log(symbols)
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
            let usdtToBtc = 1 / ((pairs.filter(p => p.symbol === 'BTCUSDT'))[0].price);
            keys.forEach(k => {
              let pairSymbol = k.toUpperCase()+'USDT';
                currentBalance = {
                    ...currentBalance,
                    [k]: {
                        'balance': historicalBySymbol[k].reduce((a, b) => a + b, 0),
                        'image': images[k],
                        'idSymbol':symbols[k],
                        //'inUsdt': k === 'usdt' ? historicalBySymbol[k].reduce((a, b) => a + b, 0) : (pairs.filter(p => p.symbol === pairSymbol))[0] ? (pairs.filter(p => p.symbol === pairSymbol))[0].price * historicalBySymbol[k].reduce((a, b) => a + b, 0) : '',
                        //'inBtc': k === 'usdt' ? (historicalBySymbol[k].reduce((a, b) => a + b, 0)) * usdtToBtc : (pairs.filter(p => p.symbol === pairSymbol))[0] ? ((pairs.filter(p => p.symbol === pairSymbol))[0].price) * usdtToBtc * historicalBySymbol[k].reduce((a, b) => a + b, 0) : '',
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
    }});

module.exports = portfolio
