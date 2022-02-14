const order = require('express').Router()
const { Order, Transaction, User,Symbol, Pair } = require('../db')
const { isAuthenticated } = require('../JWT/JSONWT')
const { getBalance } = require('../GetBalance')
const axios = require('axios')

order.get('/', isAuthenticated, async (req,res) =>{
  try{
    let { status, dateFrom, dateTo } = req.query
    let orders = await Order.findAll({
      where: {
        userId: req.user.id
      }
    })
    
    orders = orders.map(o => o.toJSON())

    console.log(orders)
    if(status !== undefined && status != 4)
      orders = orders.filter(o => status == o.status)
    
    if(dateFrom){
      let date = dateFrom.split('-')
      let dia = new Date(date[0],(date[1]-1),date[2])
      orders = orders.filter(o =>{
        let fecha = new Date(o.updatedAt)
        return fecha - dia > 0
      })
    }

    if(dateTo){
      let dateto = dateTo.split('-')
      let diato = new Date(dateto[0],dateto[1]-1, dateto[2])
      orders = orders.filter(o => {
        let fecha = new Date(o.updatedAt)
        return diato - fecha >= 0
      })
    }

    
    res.json(orders)
  }catch(err){
    res.status(500).json(err)
  }
} )

order.get('/:id', isAuthenticated, async(req, res)=> {
  try{
    let { id } = req.params
    
    const order = await Order.findOne({
      where: {
        id,
        userId: req.user.id
      }
    })
    if(!order) return res.status(404).json({errorType:'orderError', errorCode:'1310', errorMessage:'Order not found for this user'})
    return res.json(order)
  }catch(err){
    res.status(500).json(err)
  }
})

order.post('/', isAuthenticated,async(req,res) => {
  try{
    let {buyOrder, symbol1Id, symbol2Id, amount, marketOrder, priceLimit} = req.body
    if(buyOrder) {
      let aux = symbol1Id
      symbol1Id = symbol2Id,
      symbol2Id = aux
    }
    const symbol1 = await Symbol.findByPk(Number(symbol1Id))
    const symbol2 = await Symbol.findByPk(Number(symbol2Id))
    let pair = symbol1.toJSON().symbol.toUpperCase() + symbol2.toJSON().symbol.toUpperCase()
    let pairValid;
    try{
      pairValid = (await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${pair}`)).data
    }catch(e){
      try{
        pair = symbol2.toJSON().symbol.toUpperCase() + symbol1.toJSON().symbol.toUpperCase()
        pairValid = (await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${pair}`)).data
      }catch(e){
        return res.status(404).json({errorType: 'orderError', errorCode:'1310', errorMessage:'Invalid Pair'})
      }
    }
    const user = await User.findByPk(req.user.id)
    const [pairDb,created] = await Pair.findOrCreate({
      where: {
        pair: pairValid.symbol
      },
      defaults: {
        price: pairValid.price,
      }
    })
    if(created){
      await pairDb.setSymbol1(symbol1);
      await pairDb.setSymbol2(symbol2)
    }
    
    if(buyOrder){
      const cantidad = await getBalance(req.user.id, symbol2Id)
      if(cantidad && cantidad.balance >= amount){
        const newOrder = await Order.create({
            buyOrder, 
            amount, 
            marketOrder, 
            priceLimit: priceLimit ? priceLimit : 0,
            status: 0,
            confirmationRequeried: false,
            sendOnPending:true,
            sendOnFullfiled:false,
            sendOnCanceled:false,
        })
        await newOrder.setSymbolSell(symbol2)
        await newOrder.setSymbolBuy(symbol1)
        await newOrder.setUser(user)
        
        return res.json(newOrder)
      }else{
        return res.status(404).json({errorType:'orderError', errorCode: '1340', errorMessage:'Insufficient balance'})
      }
    }else{
      const cantidad = await getBalance(req.user.id, symbol1Id)

      if(cantidad && cantidad.balance >= amount){
        const newOrder = await Order.create({
            buyOrder, 
            amount, 
            marketOrder, 
            priceLimit: priceLimit ? priceLimit : 0,
            status: 0,
            confirmationRequeried: false,
            sendOnPending:true,
            sendOnFullfiled:false,
            sendOnCanceled:false,
        })
        await newOrder.setSymbolSell(symbol1)
        await newOrder.setSymbolBuy(symbol2)
        await newOrder.setUser(user)
         
        return res.json(newOrder)
      }else{
        return res.status(404).json({errorType:'orderError', errorCode: '1340', errorMessage:'Insufficient balance'})
      }
    }
  }catch(err){
    res.status(500).json(err)
  }
})

order.put('/:id', isAuthenticated, async (req,res) => {
  try{
    let {buyOrder, amount, marketOrder, priceLimit }= req.body
    const order = await Order.findOne({
      where:{
        userId: req.user.id,
        id: req.params.id,
        status: 0
      }
    })
    if(!order) return res.status(404).json({errorType: 'orderError', errorCode:'1310', errorMessage:'Order not found or the order maybe it is fullfiled or canceled'})
    await order.update({
      buyOrder,
      amount,
      marketOrder,
      priceLimit: priceLimit ? priceLimit : 0
    })
   res.json(order)
  }catch(err){
    res.status(500).json(err)
  }
})

order.delete('/:id', isAuthenticated, async (req,res)=>{
  try{
    const order = await Order.findByPk(req.params.id)
    
    if(!order) return res.status(404).json({errorType:'orderError', errorCode:'1320', errorMessage:'Order not found'})

    await Order.destroy({
      where: {
        id: order.toJSON().id,
        userId: req.user.id,
        status: 0
      }
    })
    res.json({message: 'Subscription eliminated'})
  }catch(err){

  }
})

module.exports = order
