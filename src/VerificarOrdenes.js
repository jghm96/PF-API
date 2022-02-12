const cron = require('node-cron')
const { getBalance } = require('./GetBalance')
const executeOrder = require('./ExecuteOrder')
const { Order } = require('./db')
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
      }
    })

    await orders.forEach(async o => {
      console.log(o.userId, o.idSymbolToSell, 'orden')
      const balance = await getBalance(o.userId, o.idSymbolToSell)
      let order ;
      console.log(balance.balance, o.amount)
      if(balance.balance > o.amount){
        order =  await executeOrder(o.userId, o.id)
      }
      console.log(order)
    })
  }catch(err){
    res.status(500).json(err)
  }
})
