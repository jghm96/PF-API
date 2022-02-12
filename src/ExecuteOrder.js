const { User, Order, Symbol, Transaction } = require('./db')
const axios = require('axios')

const executeOrder = async(userId, orderId) => {
  try{
    const user = await User.findByPk(userId)
    console.log(user)
    const order = await Order.findByPk(orderId)
    let orderJ = order.toJSON()
    const symbolBuy = await Symbol.findByPk(orderJ.idSymbolToBuy)
    const symbolSell = await Symbol.findByPk(orderJ.idSymbolToSell)
    let symbolPair = symbolSell.toJSON().symbol.toUpperCase() + symbolBuy.toJSON().symbol.toUpperCase()
    let pair;
    let pairInverso = null;
    try{
      pair = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${symbolPair}`)
    }catch(e){
      try{
        pairInverso = symbolBuy.toJSON().symbol.toUpperCase() + symbolSell.toJSON().symbol.toUpperCase()
        pair = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${pairInverso}`)
      }catch(e){
        return console.log('pair Invalid')
      }
    }
    console.log(pair.data, orderJ)
    if(orderJ.marketOrder){
      const transactionSell = await Transaction.create({
        withdraw: orderJ.amount,
        deposit:0
      })
      await user.addTransaction(transactionSell)
      await symbolSell.addTransaction(transactionSell)

      const transactionBuy = await Transaction.create({
        withdraw:0,
        deposit: pairInverso !== null ? (orderJ.amount/pair.data.price) : (orderJ.amount * pair.data.price)
      })

      await user.addTransaction(transactionBuy)
      await symbolBuy.addTransaction(transactionBuy)
      
      await order.update({
        status:1,
        sendOnPending: false,
        sendOnFullfiled: true
      })
    }else if(order.buyOrder && orderJ.priceLimit < pair.data.price){
      const transactionSell = await Transaction.create({
        withdraw: orderJ.amount,
        deposit:0
      })
      await user.addTransaction(transactionSell)
      await symbolSell.addTransaction(transactionSell)

      const transactionBuy = await Transaction.create({
        withdraw:0,
        deposit: pairInverso ? (orderJ.amount/pair.data.price) : (orderJ.amount * pair.data.price)
      })

      await user.addTransaction(transactionBuy)
      await symbolBuy.addTransaction(transactionBuy)
      
      await order.update({
        status:1,
        sendOnPending: false,
        sendOnFullfiled: true
      })
    }else if(!order.buyOrder && orderJ.priceLimit > pair.data.price){
      const transactionSell = await Transaction.create({
        withdraw: orderJ.amount,
        deposit:0
      })
      await user.addTransaction(transactionSell)
      await symbolSell.addTransaction(transactionSell)

      const transactionBuy = await Transaction.create({
        withdraw:0,
        deposit: pairInverso ? (orderJ.amount/pair.data.price) : (orderJ.amount * pair.data.price)
      })

      await user.addTransaction(transactionBuy)
      await symbolBuy.addTransaction(transactionBuy)
      
      await order.update({
        status:1,
        sendOnPending: false,
        sendOnFullfiled: true
      })

    }
  }
  catch(e){
    console.log(e)
  }
}

module.exports = executeOrder
