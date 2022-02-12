const { Transaction, Symbol } = require('./db')

async function getBalance(userId,symbolId){
    const data = await Transaction.findAll({
        where: { userId, symbolId },
        attributes: ["id", "deposit", "withdraw"],
        include: {
            model: Symbol,
            attributes: ["symbol",'image']
        }
    });
    if(!data.length) return []
    var history = [];
    data.forEach(t=>{
        history.push(t.deposit!==0?t.deposit:-t.withdraw)
    })
    return {
        balance:history.reduce((a, b) => a + b, 0),
        symbol:data[0].symbol.symbol,
        image:data[0].symbol.image
    }
}

module.exports = { getBalance }
