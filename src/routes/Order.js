const order = require('express').Router()
const { Order, Transaction, User,Symbol, Pair, ErrorLog } = require('../db')
const { isAuthenticated } = require('../JWT/JSONWT')
const { getBalance } = require('../GetBalance')
const axios = require('axios')

order.get('/', isAuthenticated, async (req,res) =>{
  try{
    let { status, dateFrom, dateTo } = req.query
    let orders = await Order.findAll({
      where: {
        userId: req.user.id
      },
      include:[
        {
          model:Pair,
          attributes:['price','symbol1Id']
        },
        {
          model: Symbol, 
          as:'SymbolBuy', 
          attributes:['symbol','image']
        },
        {
          model:Symbol,
          as:'SymbolSell',
          attributes:['symbol','image']
        }
      ]
    })
    orders = orders.map(o => {
      let or = o.toJSON()
      let date = new Date(or.updatedAt)
      console.log(or.pair.symbol1Id, or.idSymbolToSell)
      let month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth()
      return {
        id: or.id,
        buyOrder: or.buyOrder,
        marketOrder: or.marketOrder,
        priceLimit: or.priceLimit,
        status: or.status,
        amount: or.amount,
        confirmationRequeried: or.confirmationRequeried,
        price: or.pair.symbol1Id !== or.idSymbolToSell ? (1/or.pair.price) : Number(or.pair.price),
        sendOnPending: or.sendOnPending,
        sendOnFullfiled: or.sendOnFullfiled,
        sendOnCanceled: or.sendOnCanceled,
        userId: or.userId,
        SymbolBuy: or.SymbolBuy,
        idSymbolToBuy: or.idSymbolToBuy,
        SymbolSell: or.SymbolSell,
        idSymbolToSell: or.idSymbolToSell,
        date: `${date.getFullYear()}/${month}/${date.getDate()}`
      }
    })

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
    orders = orders.sort((a,b) => a.id - b.id )
    res.json(orders)
  }catch(err){
    res.status(500).json(err)
  }
} )

order.get('/:id', isAuthenticated, async(req, res)=> {
  try{
    let { id } = req.params
    
    let order = await Order.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include:[
        {
          model: Symbol, 
          as:'SymbolBuy', 
          attributes:['symbol','image']
        },
        {
          model:Symbol,
          as:'SymbolSell',
          attributes:['symbol','image']
        }
      ]
    })

    if(!order){
      await ErrorLog.create({
        userId: req.user.id,
        Method: Object.keys(req.route.methods)[0],
        Route: JSON.stringify("orders"+req.route.path),
        Body: JSON.stringify(req.body),
        errorType:'orderError', 
        errorCode:'1310', 
        errorMessage:'Order not found for this user'
      })
      return res.status(404).json({errorType:'orderError', errorCode:'1310', errorMessage:'Order not found for this user'})
    }
    let or = order.toJSON()
    let date = new Date(or.updatedAt)
    let month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth()
    order = {
      id: or.id,
      buyOrder: or.buyOrder,
      marketOrder: or.marketOrder,
      priceLimit: or.priceLimit,
      status: or.status,
      amount: or.amount,
      confirmationRequeried: or.confirmationRequeried,
      sendOnPending: or.sendOnPending,
      sendOnFullfiled: or.sendOnFullfiled,
      sendOnCanceled: or.sendOnCanceled,
      userId: or.userId,
      SymbolBuy: or.SymbolBuy,
      idSymbolToBuy: or.idSymbolToBuy,
      SymbolSell: or.SymbolSell,
      idSymbolToSell: or.idSymbolToSell,
      date: `${date.getFullYear()}/${month}/${date.getDate()}`
    }
    return res.json(order)
  }catch(err){
    res.status(500).json(err)
  }
})

order.post('/', isAuthenticated,async(req,res) => {
  try{
    let {buyOrder, symbol1Id, symbol2Id, amount, marketOrder, priceLimit} = req.body
    const symbol1 = await Symbol.findByPk(Number(symbol1Id))
    const symbol2 = await Symbol.findByPk(Number(symbol2Id))
    let pair = symbol1.toJSON().symbol.toUpperCase() + symbol2.toJSON().symbol.toUpperCase()
    let reversePair = null;
    let pairValid;
    try{
      pairValid = (await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${pair}`)).data
    }catch(e){
      try{
        reversePair = symbol2.toJSON().symbol.toUpperCase() + symbol1.toJSON().symbol.toUpperCase()
        pairValid = (await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${reversePair}`)).data
      }catch(e){
        await ErrorLog.create({
          userId: req.user.id,
          Method: Object.keys(req.route.methods)[0],
          Route: JSON.stringify("orders"+req.route.path),
          Body: JSON.stringify(req.body),
          errorType: 'orderError', 
          errorCode:'1310', 
          errorMessage:'Invalid Pair'
        })
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
       if(reversePair){
        await pairDb.setSymbol1(symbol2);
        await pairDb.setSymbol2(symbol1);

      }else{
        await pairDb.setSymbol1(symbol1);
        await pairDb.setSymbol2(symbol2);
      }
    }
    
    if(buyOrder){
      const cantidad = await getBalance(req.user.id, symbol2Id)
      let amountTotal = reversePair ? Number(amount*(1/pairValid.price)) : Number(amount*pairValid.price)
      if(cantidad && cantidad.balance >= amountTotal){
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
        await newOrder.setPair(pairDb)
        
        return res.json(newOrder)
      }else{
        await ErrorLog.create({
          userId: req.user.id,
          Method: Object.keys(req.route.methods)[0],
          Route: JSON.stringify("orders"+req.route.path),
          Body: JSON.stringify(req.body),
          errorType:'orderError', 
          errorCode: '1340', 
          errorMessage:'Insufficient balance'
        })
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
        await newOrder.setPair(pairDb)
         
        return res.json(newOrder)
      }else{
        await ErrorLog.create({
          userId: req.user.id,
          Method: Object.keys(req.route.methods)[0],
          Route: JSON.stringify("orders"+req.route.path),
          Body: JSON.stringify(req.body),
          errorType:'orderError', 
          errorCode: '1340', 
          errorMessage:'Insufficient balance'
        })
        return res.status(404).json({errorType:'orderError', errorCode: '1340', errorMessage:'Insufficient balance'})
      }
    }
  }catch(err){
    res.status(500).json(err)
  }
})

order.put('/:id', isAuthenticated, async (req,res) => {
  try{
    let {buyOrder, symbol1Id, symbol2Id, amount, marketOrder, priceLimit} = req.body    
    const order = await Order.findOne({
      where:{
        userId: req.user.id,
        id: req.params.id,
        status: 0
      }
    })
    if(!order){
      await ErrorLog.create({
        userId: req.user.id,
        Method: Object.keys(req.route.methods)[0],
        Route: JSON.stringify("orders"+req.route.path),
        Body: JSON.stringify(req.body),
        errorType: 'orderError', 
        errorCode:'1310', 
        errorMessage:'Order not found or the order maybe it is fullfiled or canceled'
        })
      return res.status(404).json({errorType: 'orderError', errorCode:'1310', errorMessage:'Order not found or the order maybe it is fullfiled or canceled'})
    }
    let symbol1 = await Symbol.findByPk(symbol1Id)
    let symbol2 = await Symbol.findByPk(symbol2Id)
    let pair = symbol1.toJSON().symbol.toUpperCase() + symbol2.toJSON().symbol.toUpperCase()
    let reversePair = null;
    let pairValid;
    try{
      pairValid = (await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${pair}`)).data
    }catch(e){
      try{
        reversePair = symbol2.toJSON().symbol.toUpperCase() + symbol1.toJSON().symbol.toUpperCase()
        pairValid = (await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${reversePair}`)).data
      }catch(e){
        await ErrorLog.create({
          userId: req.user.id,
          Method: Object.keys(req.route.methods)[0],
          Route: JSON.stringify("orders"+req.route.path),
          Body: JSON.stringify(req.body),
          errorType: 'orderError', 
          errorCode:'1310', 
          errorMessage:'Invalid Pair'
        })
        return res.status(404).json({errorType: 'orderError', errorCode:'1310', errorMessage:'Invalid Pair'})
      }
    }
    const [pairDb,created] = await Pair.findOrCreate({
      where: {
        pair: pairValid.symbol
      },
      defaults: {
        price: pairValid.price,
      }
    })
    if(created){
       if(reversePair){
        await pairDb.setSymbol1(symbol2);
        await pairDb.setSymbol2(symbol1);

      }else{
        await pairDb.setSymbol1(symbol1);
        await pairDb.setSymbol2(symbol2);
      }
    }

    if(buyOrder){
      const balance = await getBalance(req.user.id, symbol2Id)
      if(balance.balance >= amount){
         await order.setSymbolSell(symbol2Id)
         await order.setSymbolBuy(symbol1Id) 
         await order.setPair(pairDb)
      }else{
         await ErrorLog.create({
          userId: req.user.id,
          Method: Object.keys(req.route.methods)[0],
          Route: JSON.stringify("orders"+req.route.path),
          Body: JSON.stringify(req.body),
          errorType:'orderError', 
          errorCode: '1340', 
          errorMessage:'Insufficient balance'
        })
        return res.status(404).json({errorType:'orderError', errorCode: '1340', errorMessage:'Insufficient balance'})
      }
    }else{
      const balance = await getBalance(req.user.id, symbol1Id)
      if(balance.balance >= amount){
         await order.setSymbolSell(symbol1Id)
         await order.setSymbolBuy(symbol2Id) 
         await order.setPair(pairDb)
      }else{
         await ErrorLog.create({
          userId: req.user.id,
          Method: Object.keys(req.route.methods)[0],
          Route: JSON.stringify("orders"+req.route.path),
          Body: JSON.stringify(req.body),
          errorType:'orderError', 
          errorCode: '1340', 
          errorMessage:'Insufficient balance'
        })
        return res.status(404).json({errorType:'orderError', errorCode: '1340', errorMessage:'Insufficient balance'})
      }

    }
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
    const order = await Order.findOne({
      where:{
        id: req.params.id,
        userId: req.user.id,
      }
    })
    
    if(!order){
      await ErrorLog.create({
        userId: req.user.id,
        Method: Object.keys(req.route.methods)[0],
        Route: JSON.stringify("orders"+req.route.path),
        Body: JSON.stringify(req.body),
        errorType:'orderError', 
        errorCode:'1320', 
        errorMessage:'Order not found'
        })
      return res.status(404).json({errorType:'orderError', errorCode:'1320', errorMessage:'Order not found for this user'})
    }
    if(order.toJSON().sendOnPending === false){
      await ErrorLog.create({
        userId: req.user.id,
        Method: Object.keys(req.route.methods)[0],
        Route: JSON.stringify("orders"+req.route.path),
        Body: JSON.stringify(req.body),
        errorType:'orderError', 
        errorCode:'1350', 
        errorMessage:'Order fullfiled or canceled'
      })
      return res.status(404).json({errorType:'orderError', 
        errorCode:'1350', 
        errorMessage:'Order fullfiled or canceled'})
    }
    await order.destroy({
      where: {
        id: order.toJSON().id,
        userId: req.user.id,
        status: 0
      }
    })
    res.json({message: 'Order eliminated'})
  }catch(err){

  }
})

module.exports = order
