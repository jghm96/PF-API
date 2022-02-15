const express = require('express')
const rSubscription = express.Router()
const { Symbol, User, Pair, Susbcription, ErrorLog } = require('../db')
const { isAuthenticated } = require('../JWT/JSONWT')
const transporter = require('../Mail')
const axios = require('axios')


rSubscription.get('/', isAuthenticated ,async (req, res) => {
  try{
    const subscriptions = await Susbcription.findAll({
      where:{
        userId: req.user.id
      },
      include: [{model:Pair, required: true, attributes: ['id','price', 'pair'], include: [{model: Symbol, as:'Symbol1', attributes:['id','symbol','image']}, {model: Symbol, as:'Symbol2', attributes:['id','symbol','image']}]}]
    })
    let json = subscriptions.map(s => s.toJSON())
    const format = json.map(s => {
      return {
        id: s.id,
        risePrice: s.risePrice,
        fallPrice: s.fallPrice,
        alertOnRise: s.alertOnRise,
        alertOnFall: s.alertOnFall,
        pair: [s.pair.pair, s.pair.price],
        symbol1Id: s.pair.Symbol1.id,
        symbol1: [s.pair.Symbol1.symbol, s.pair.Symbol1.image],
        symbol2Id: s.pair.Symbol2.id,
        symbol2: [s.pair.Symbol2.symbol, s.pair.Symbol2.image]
      }
    })
    res.json(format)
  
  }catch(err){
    res.status(500).json(err)
  }
})

rSubscription.get('/:id', isAuthenticated,async (req, res) => {
  try{
    let subscription = await Susbcription.findOne({
       where: {
        userId : req.user.id,
         id: req.params.id
      },
       include: [{model:Pair, required: true, attributes: ['id','price', 'pair'], include: [{model: Symbol, as:'Symbol1', attributes:['id']}, {model: Symbol, as:'Symbol2', attributes:['id']}]}]   
    });
    if(!subscription){ 
      await ErrorLog.create({
        userId: req.user.id,
        Method: Object.keys(req.route.methods)[0],
        Route: JSON.stringify("subs"+req.route.path),
        Body: JSON.stringify(req.body),
        errorType:'subscriptionError', 
        errorCode:'1210' , 
        errorMessage: 'Subscription dont find'
      })
      
      return res.status(404).json({errorType:'subscriptionError', errorCode:'1210' , errorMessage: 'Subscription dont find'})
    }
    subscription = subscription.toJSON()
    const format = {
      id: subscription.id,
      risePrice: subscription.risePrice,
      fallPrice: subscription.fallPrice,
      alertOnRise: subscription.alertOnRise,
      alertOnFall: subscription.alertOnFall,
      symbol1Id: subscription.pair.Symbol1.id,
      symbol2Id: subscription.pair.Symbol2.id
    }
    res.json(format)
  }catch(err){
    res.status(500).json(err)
  }
})

rSubscription.post('/', isAuthenticated,async (req, res) => {
  try{
    let {symbol1Id, symbol2Id, risePrice, fallPrice } = req.body
    
    const user = await User.findByPk(req.user.id)
    const symbol1 = await Symbol.findOne({
      where: {
        id: Number(symbol1Id)
      }
    })
      
    const symbol2 = await Symbol.findOne({
      where: {
        id: Number(symbol2Id)
      }
    })  
    const pair = symbol1.toJSON().symbol.toUpperCase() + symbol2.toJSON().symbol.toUpperCase()
    let response;
    let pairApi;
    let reversePair = null;
    try{
      response = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${pair}`)
    }catch(e){
      try{
        reversePair = symbol2.toJSON().symbol.toUpperCase() + symbol1.toJSON().symbol.toUpperCase()
        response = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${reversePair}`)
      }catch(err){
        await ErrorLog.create({
          userId: req.user.id,
          Method: Object.keys(req.route.methods)[0],
          Route: JSON.stringify("subs"+req.route.path),
          Body: JSON.stringify(req.body),
          errorType:'subscriptionError', 
          errorCode:'1420', 
          errorMessage : 'Invalid Pair'
      })
        return res.status(404).json({errorType:'subscriptionError', errorCode:'1420', errorMessage : 'Invalid Pair'})
      }
    }
    pairApi = response.data
    const [pairDb, created] = await Pair.findOrCreate({
      where: {
        pair: pairApi.symbol
      },
      defaults: {
        price: Number(pairApi.price)
      }
    })
    
    if(created){
      await pairDb.setSymbol1(symbol1);
      await pairDb.setSymbol2(symbol2)
    }
    
    const [subscription, createds] = await Susbcription.findOrCreate({
        where: {
          userId : req.user.id,
          pairId : pairDb.toJSON().id
        },
        defaults :{
         risePrice: risePrice === undefined || risePrice < 0 ? 0 : risePrice,
         fallPrice: fallPrice === undefined || fallPrice < 0 ? 0 : fallPrice,
         alertOnFall: fallPrice === undefined || fallPrice <= 0 ? false : true,
         alertOnRise: risePrice === undefined || risePrice <= 0 ? false : true
 
        }
      }) 
    if(!createds) {
      await ErrorLog.create({
        userId: req.user.id,
        Method: Object.keys(req.route.methods)[0],
        Route: JSON.stringify("subs"+req.route.path),
        Body: JSON.stringify(req.body),
        errorType:'subscriptionError', 
        errorCode:'1230',
        errorMessage : 'Subscription already exists'
      })
      return res.status(404).json({errorType:'subscriptionError', errorCode:'1230',errorMessage : 'Subscription already exists'})
    }
    
    await subscription.setUser(user)
    await subscription.setPair(pairDb)
    res.json(subscription)

  }catch(err){
    res.status(500).json(err)
  }
})

rSubscription.put('/:id', isAuthenticated, async (req, res) => {
  try {
    let { symbol1Id, symbol2Id , risePrice, fallPrice } = req.body
    const symbol1 = await Symbol.findByPk(Number(symbol1Id))
    const symbol2 = await Symbol.findByPk(Number(symbol2Id))
    if(!symbol1 || !symbol2 ){
      await ErrorLog.create({
        userId: req.user.id,
        Method: Object.keys(req.route.methods)[0],
        Route: JSON.stringify("subs"+req.route.path),
        Body: JSON.stringify(req.body),
        errorType:'subscriptionError', 
        errorCode:'1210', 
        errorMessage: 'One of the symbols does not exists at the Symbols DB'
      })
      return res.status(404).json({errorType:'subscriptionError', errorCode:'1210', errorMessage: 'One of the symbols does not exists at the Symbols DB'})
    } 
    const pair = symbol1.toJSON().symbol.toUpperCase() + symbol2.toJSON().symbol.toUpperCase()
    let response;
    let pairApi;
    let reversePair = null;
    try{
      response = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${pair}`)
    }catch(e){
      try{
        reversePair = symbol2.toJSON().symbol.toUpperCase() + symbol1.toJSON().symbol.toUpperCase()
        response = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${reversePair}`)
      }catch(err){
        await ErrorLog.create({
          userId: req.user.id,
          Method: Object.keys(req.route.methods)[0],
          Route: JSON.stringify("subs"+req.route.path),
          Body: JSON.stringify(req.body),
          errorType:'subscriptionError', 
          errorCode:'1420', 
          errorMessage : 'Invalid Pair'
      })
        return res.status(404).json({errorType:'subscriptionError', errorCode:'1420', errorMessage : 'Invalid Pair'})
      }
    }
    pairApi = response.data
    const [pairDb, created] = await Pair.findOrCreate({
      where: {
        pair: pairApi.symbol
      },
      defaults: {
        price: Number(pairApi.price)
      }
    })
    
    if(created){
      await pairDb.setSymbol1(symbol1);
      await pairDb.setSymbol2(symbol2)
    }
    
    const subAntigua = await Susbcription.findByPk(req.params.id)
    const sub = await Susbcription.findOne({
      where:{
        userId: req.user.id,
        pairId: pairDb.toJSON().id
      }
    })

    if(sub && subAntigua.toJSON().pairId !== sub.toJSON().pairId){
      await ErrorLog.create({
        userId: req.user.id,
        Method: Object.keys(req.route.methods)[0],
        Route: JSON.stringify("subs"+req.route.path),
        Body: JSON.stringify(req.body),
        errorType:'subscriptionError', 
        errorCode:'1230',
        errorMessage : 'Subscription already exists'      
      })
      return res.status(404).json({errorType:'subscriptionError', errorCode:'1230',errorMessage : 'Subscription already exists'})
    }
    await Susbcription.update({
      risePrice: risePrice === undefined || risePrice < 0 ? 0 : risePrice,
      fallPrice: fallPrice === undefined || fallPrice < 0 ? 0 : fallPrice,
      alertOnFall: fallPrice === undefined || fallPrice <= 0 ? false : true,
      alertOnRise: risePrice === undefined || risePrice <= 0 ? false : true
    }, {
      where:{
        userId : req.user.id,
        id: req.params.id
      }
    })
    const updated = await Susbcription.findOne({
      where: {
        userId: req.user.id,
        id: req.params.id
      }
    })
    if(!updated){
      await ErrorLog.create({
        userId: req.user.id,
        Method: Object.keys(req.route.methods)[0],
        Route: JSON.stringify("subs"+req.route.path),
        Body: JSON.stringify(req.body),
        errorType:'subscriptionError', 
        errorCode:'1250' ,
        errorMessage: 'There was a problem while updating the registry'      
      })
      return res.status(404).json({errorType:'subscriptionError', errorCode:'1250' ,errorMessage: 'There was a problem while updating the registry'})
    }
    await updated.setPair(pairDb)
    res.json(updated)
    
  }catch(err){
    res.status(500).json(err)
  }
})

rSubscription.delete('/:id', isAuthenticated,async (req, res) => { //Ruta para desuscribirse de una crypto que un usuario haya tenido como subscripcion
  try {
    const unsubscription = await Susbcription.destroy({
      where: {
        userId: req.user.id,
        id: req.params.id
      }
    })
    if(!unsubscription){
      await ErrorLog.create({
        userId: req.user.id,
        Method: Object.keys(req.route.methods)[0],
        Route: JSON.stringify("subs"+req.route.path),
        Body: JSON.stringify(req.body),
        errorType:'subscriptionError', 
        errorCode:'1210', 
        errorMessage: 'This subscription does not exists for this user'      
      })
      return res.status(401).json({errorType:'subscriptionError', errorCode:'1210', errorMessage: 'This subscription does not exists for this user'}) 
    }
    res.json({message : 'Subscription eliminated'})
  }catch(err){
    res.status(500).json(err)
  }
})

module.exports = rSubscription
