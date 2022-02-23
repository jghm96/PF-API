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
    ordersT = orders.map( o => o.toJSON() )
    /*orders.forEach(async (o) => {*/
      /*const balance = await getBalance(o.userId, o.idSymbolToSell)*/
      /*let order;*/
      /*let amountTotal = o.idSymbolToSell === o.pair.symbol1Id ? o.amount*(1/o.pair.price) : o.amount*o.pair.price*/
      /*if(!o.buyOrder && balance.balance >= o.amount){*/
        /*order =  await executeOrder(o.userId, o.id)*/
      /*}else if(o.buyOrder && balance.balance >= amountTotal){*/
        /*order =  await executeOrder(o.userId, o.id)*/
      /*}*/
    /*})*/
    for(let x=0; x < orders.length; x++){
      const balance = await getBalance(ordersT[x].userId, ordersT[x].idSymbolToSell)
      let order;
      let amountTotal = ordersT[x].idSymbolToSell === ordersT[x].pair.symbol1Id ? ordersT[x].amount*(1/ordersT[x].pair.price) : ordersT[x].amount*ordersT[x].pair.price
      if(!ordersT[x].buyOrder && balance.balance >= ordersT[x].amount){
        order =  await executeOrder(ordersT[x].userId, orders[x].id)
      }else if(ordersT[x].buyOrder && balance.balance >= amountTotal){
        order =  await executeOrder(orders[x].userId, orders[x].id)
      }else if(ordersT[x].marketOrder){
        await orders[x].update({
          status: 2,
          sendOnPending:false,
          sendOnCanceled:true,
        })
      }
  }
  }catch(err){
    console.log(err)
  }
})




//module.exports = executeOrder
