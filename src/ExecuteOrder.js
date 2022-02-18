const { User, Order, Symbol, Transaction } = require('./db')
const axios = require('axios')
const sendEmail = require('./Mail')

const executeOrder = async(userId, orderId) => {
  try{
    const user = await User.findByPk(userId)
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
    if(orderJ.marketOrder){
      const transactionSell = await Transaction.create({
        withdraw: orderJ.buyOrder ? !pairInverso ? orderJ.amount*(1/pair.data.price) : orderJ.amount * pair.data.price: orderJ.amount,
        deposit:0
      })
      await user.addTransaction(transactionSell)
      await symbolSell.addTransaction(transactionSell)
      await transactionSell.setOrder(order)

      const transactionBuy = await Transaction.create({
        withdraw:0,
        deposit: !orderJ.buyOrder ? pairInverso !== null ? (orderJ.amount/pair.data.price) : (orderJ.amount * pair.data.price) : orderJ.amount
      })

      await user.addTransaction(transactionBuy)
      await symbolBuy.addTransaction(transactionBuy)
      await transactionBuy.setOrder(order)
      
      await order.update({
        status:1,
        sendOnPending: false,
        sendOnFullfiled: true
      })
      const subject = `Transactions for the Order #${orderJ.id}`
      const html = `
                  <div>
                    <h2>Transaction Sell</h2>
                    <ul>
                      <li>Selled coin: ${symbolSell.toJSON().symbol}</li>
                      <li>Amount: ${transactionSell.toJSON().withdraw}</li>
                    </ul>
                    <h2>Transaction Buy</h2>
                    <ul>
                      <li>Bought coin: ${symbolBuy.toJSON().symbol}</li>
                      <li>Amount: ${transactionBuy.toJSON().deposit}</li>
                    </ul>
                  </div>
      `
      await sendEmail(user.toJSON().email, subject, html)
    }else if(order.buyOrder && orderJ.priceLimit > pair.data.price){
      const transactionSell = await Transaction.create({
        withdraw: orderJ.buyOrder ? !pairInverso ? orderJ.amount*(1/pair.data.price) : orderJ.amount * pair.data.price: orderJ.amount,
        deposit:0
      })
      await user.addTransaction(transactionSell)
      await symbolSell.addTransaction(transactionSell)
      await transactionSell.setOrder(order)

      const transactionBuy = await Transaction.create({
        withdraw:0,
        deposit: !orderJ.buyOrder ? pairInverso !== null ? (orderJ.amount/pair.data.price) : (orderJ.amount * pair.data.price) : orderJ.amount      
      })

      await user.addTransaction(transactionBuy)
      await symbolBuy.addTransaction(transactionBuy)
      await transactionBuy.setOrder(order)

      await order.update({
        status:1,
        sendOnPending: false,
        sendOnFullfiled: true
      })
      const subject = `Transactions for the Order #${orderJ.id}`
      const html = `
                  <div>
                    <h2>Transaction Sell</h2>
                    <ul>
                      <li>Selled coin: ${symbolSell.toJSON().symbol}</li>
                      <li>Amount: ${transactionSell.toJSON().withdraw}</li>
                    </ul>
                    <h2>Transaction Buy</h2>
                    <ul>
                      <li>Bought coin: ${symbolBuy.toJSON().symbol}</li>
                      <li>Amount: ${transactionBuy.toJSON().deposit}</li>
                    </ul>
                  </div>
      `
      await sendEmail(user.toJSON().email, subject, html)

    }else if(!order.buyOrder && orderJ.priceLimit < pair.data.price){
      const transactionSell = await Transaction.create({
        withdraw: orderJ.buyOrder ? !pairInverso ? orderJ.amount*(1/pair.data.price) : orderJ.amount * pair.data.price: orderJ.amount,
        deposit:0
      })
      await user.addTransaction(transactionSell)
      await symbolSell.addTransaction(transactionSell)
      await transactionSell.setOrder(order)

      const transactionBuy = await Transaction.create({
        withdraw:0,
        deposit: !orderJ.buyOrder ? pairInverso !== null ? (orderJ.amount/pair.data.price) : (orderJ.amount * pair.data.price) : orderJ.amount 
      })

      await user.addTransaction(transactionBuy)
      await symbolBuy.addTransaction(transactionBuy)
      await transactionBuy.setOrder(order)

      await order.update({
        status:1,
        sendOnPending: false,
        sendOnFullfiled: true
      })
      const subject = `Transactions for the Order #${orderJ.id}`
      const html = `
                  <div>
                    <h2>Transaction Sell</h2>
                    <ul>
                      <li>Selled coin: ${symbolSell.toJSON().symbol}</li>
                      <li>Amount: ${transactionSell.toJSON().withdraw}</li>
                    </ul>
                    <h2>Transaction Buy</h2>
                    <ul>
                      <li>Bought coin: ${symbolBuy.toJSON().symbol}</li>
                      <li>Amount: ${transactionBuy.toJSON().deposit}</li>
                    </ul>
                  </div>
      `
      await sendEmail(user.toJSON().email, subject, html)
    }
  }
  catch(e){
    console.log(e)
  }
}

module.exports = executeOrder
