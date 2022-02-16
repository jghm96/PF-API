const cron = require('node-cron')
const { getBalance } = require('./GetBalance')
const executeOrder = require('./ExecuteOrder')
const { Order, Pair} = require('./db')
const axios = require('axios')

module.exports = cron.schedule('* * * * *', async () => {
  try{
    const day = 82942504
    let orders = await Order.findAll({
      where: {
        status: 0
      }
    })
    await orders.forEach(async o => {
      let daySend = new Date(o.updatedAt)
      if(Date.now() - daySend >= day){
        await Order.update({
          status: 2,
          sendOnPending: false,
          sendOnCanceled: true,
        }, {
          where: {
            id: o.id
          }
        })
      }
    })

    orders = await Order.findAll({
      where:{
        status: 0
      },
      include:[{model: Pair}]
    })
  
    await orders.forEach(async o => {
      const balance = await getBalance(o.userId, o.idSymbolToSell)
      let order;
      let amountTotal = o.idSymbolToSell === o.pair.symbol1Id ? o.amount*(1/o.pair.price) : o.amount*o.pair.price
      if(!o.buyOrder && balance.balance >= o.amount){
        order =  await executeOrder(o.userId, o.id)
      }else if(o.buyOrder && balance.balance >= amountTotal){
        order =  await executeOrder(o.userId, o.id)
      }
    })
  }catch(err){
    console.log(err)
  }
})
