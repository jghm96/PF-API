const express = require('express')
const rSubscription = express.Router()
const { Symbol, User, Pair, Susbcription } = require('../db')
const { isAuthenticated } = require('../JWT/JSONWT')
const transporter = require('../Mail')
const axios = require('axios')


rSubscription.get('/', isAuthenticated ,async (req, res) => {
  try{
    const subscriptions = await Susbcription.findAll({
      where:{
        userId: req.user.id
      },
      include: [{model:Pair, required: true, attributes: ['id','price', 'pair'], include: [{model: Symbol, as:'Symbol1', attributes:['symbol','image']}, {model: Symbol, as:'Symbol2', attributes:['symbol','image']}]}]
    })
    let json = subscriptions.map(s => s.toJSON())
    const format = json.map(s => {
      console.log(s.pair.symbols)
      return {
        id: s.id,
        risePrice: s.risePrice,
        fallPrice: s.fallPrice,
        alertOnRise: s.alertOnRise,
        alertOnFall: s.alertOnFall,
        pair: [s.pair.pair, s.pair.price],
        symbol1: [s.pair.Symbol1.symbol, s.pair.Symbol1.image],
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
    console.log(subscription)
    if(!subscription) return res.status(404).json({errorType:'subscriptionError', errorCode:'1210' , errorMessage: 'Subscription dont find'})
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

/*rSubscription.post('/', isAuthenticated ,async (req, res) => { //Ruta para subscripcion a cryptos que existan en la BD
  let {symbol1Id, symbol2Id, risePrice, fallPrice } = req.body
  
  try{  
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
      const response = await axios.get('https://api.binance.com/api/v3/ticker/price')
      const pairApi= response.data
      const existence = pairApi.filter(c => c.symbol === pair)

      if(!existence.length) return res.status(404).json({errorType:'subscriptionError', errorCode:'1420', errorMessage : 'Invalid Pair'})
      
      //if(symbolsDb.length < 2) return res.status(404).json({message :'Uno de los simbolos no existe'})

      const [pairDb, created] = await Pair.findOrCreate({
        where: {
          pair: pair
        },
        defaults: {
          price: Number(existence[0].price)
        }
      })
      
      if(created){
        const symbolsDb= [symbol1, symbol2]
        await pairDb.addSymbols(symbolsDb)
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
    if(!createds) return res.status(404).json({errorType:'subscriptionError', errorCode:'1230',errorMessage : 'Subscription already exists'})
      await subscription.setUser(user)
      await subscription.setPair(pairDb)
      res.json(subscription)
    }catch(err){
    res.status(500).json(err)
  }

})*/

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
    try{
      response = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${pair}`)
      pairApi= response.data
    }catch(e){
      return res.status(404).json({errorType:'subscriptionError', errorCode:'1420', errorMessage : 'Invalid Pair'})
    }
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
    if(!createds) return res.status(404).json({errorType:'subscriptionError', errorCode:'1230',errorMessage : 'Subscription already exists'})
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
    if(!symbol1 || !symbol2 ) return res.status(404).json({errorType:'subscriptionError', errorCode:'1210', errorMessage: 'One of the symbols does not exists at the Symbols DB'})
    let pair = symbol1.toJSON().symbol.toUpperCase() + symbol2.toJSON().symbol.toUpperCase()
    const response = await axios.get('https://api.binance.com/api/v3/ticker/price')
    const pairApi = response.data
    //console.log(pairApi)
    const pairExistence = pairApi.filter(c => c.symbol === pair )
    //console.log(pairExistence)
    if(!pairExistence.length) return res.status(404).json({errorType:'subscriptionError', errorCode:'1420' , errorMessage: 'Invalid Pair'})
    //await Pair.update({
    //  price: pairExistence[0].price
    //}
    //  ,{where : {
    //    pair: pairExistence[0].symbol
    //}})
    //console.log(pairDb.toJSON())
    //console.log(req.user.id, pairDb.toJSON().id)
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
    if(!updated) return res.status(404).json({errorType:'subscriptionError', errorCode:'1250' ,errorMessage: 'There was a problem while updating the registry'})
    res.json(updated)
    
  }catch(err){
    res.status(500).json(err)
  }
})

rSubscription.delete('/:id', isAuthenticated,async (req, res) => { //Ruta para desuscribirse de una crypto que un usuario haya tenido como subscripcion
  try {
    //let { symbols } = req.body
    //const pair = symbols[0].toUpperCase() + symbols[1].toUpperCase()
    //const pairDb = await Pair.findOne({where: {pair: pair}}) // buscar Pair en BD
    //if(!pairDb) return res.status(404).json({msg: 'Pair does not exists'})
    const unsubscription = await Susbcription.destroy({
      where: {
        userId: req.user.id,
        id: req.params.id
      }
    })
    if(!unsubscription) return res.status(401).json({errorType:'subscriptionError', errorCode:'1210', errorMessage: 'This subscription does not exists for this user'}) 
    res.json({message : 'Subscription eliminated'})
  }catch(err){
    res.status(500).json(err)
  }
})

module.exports = rSubscription
