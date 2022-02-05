const express = require('express')
const rSubscription = express.Router()
const { Symbol, User, Pair, Susbcription } = require('../db')
const isAuthenticated = require('../Authenticated')
const transporter = require('../Mail')
const axios = require('axios')

rSubscription.get('/', isAuthenticated ,async (req, res) => {
  try{
    const subscriptions = await Susbcription.findAll({
      where:{
        userId: req.user.id
      },
      include: [{model:Pair, required: true, attributes: ['id','price', 'pair'], include: Symbol}]
    })
    console.log(subscriptions)
    const format = subscriptions.map(s => s.toJSON()).map(s => {
      return {
        id: s.id,
        risePrice: s.risePrice,
        fallPrice: s.fallPrice,
        alertOnRise: s.alertOnRise,
        alertOnFall: s.alertOnFall,
        pair: [s.pair.pair, s.pair.price],
        symbol1: [s.pair.symbols[1].symbol, s.pair.symbols[1].image],
        symbol2: [s.pair.symbols[0].symbol, s.pair.symbols[0].image]
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
      include: [{model:Pair, required: true, attributes: ['id','price', 'pair'], include: Symbol}]
    });
    subscription = subscription.toJSON()
    const format = {
      id: subscription.id,
      risePrice: subscription.risePrice,
      fallPrice: subscription.fallPrice,
      alertOnRise: subscription.alertOnRise,
      alertOnFall: subscription.alertOnFall,
      pair: [subscription.pair.pair, subscription.pair.price],
      symbol1: [subscription.pair.symbols[1].symbol, subscription.pair.symbols[1].image],
      symbol2: [subscription.pair.symbols[0].symbol, subscription.pair.symbols[0].image]


    }
//    if(!subscription) return res.satus(404).json({message: 'Subscription dont find'})
    res.json(format)
  }catch(err){
    res.status(500).json(err)
  }
})

rSubscription.post('/', isAuthenticated ,async (req, res) => { //Ruta para subscripcion a cryptos que existan en la BD
  let {symbol1, symbol2, risePrice, fallPrice } = req.body
  
  try{
    if(req.user){
      const userBd = await User.findAll({
        where: {
          username: req.user.username
        }
      })
      if(!userBd) return res.json({msg: 'User does not exists on BD'})
      
      const pair = symbol1.toUpperCase() + symbol2.toUpperCase()
      const symbols = [symbol1, symbol2]
      const response = await axios.get('https://api.binance.com/api/v3/ticker/price')
      const pairApi= response.data
      const existence = pairApi.filter(c => c.symbol === pair)
      
      if(!existence.length) return res.status(404).json({message : 'Invalid Pair'})
      
      const symbolsDb = await Symbol.findAll({
        where: {
          symbol: symbols
        }
      })

      const [pairDb, created] = await Pair.findOrCreate({
        where: {
          pair: pair
        },
        defaults: {
          price: Number(existence[0].price)
        }
      })
      
      if(created){
        await pairDb.addSymbols(symbolsDb)
      }
      console.log(pairDb.toJSON())
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
      if(!createds) return res.json({message : 'Subscription exists already'})
      await subscription.setUser(userBd[0])
      await subscription.setPair(pairDb)
      res.json(subscription)
    }else{
      res.status(404).json({msg : 'User error'})
    }
  }catch(err){
    res.status(500).json(err)
  }

})

rSubscription.put('/:id', isAuthenticated, async (req, res) => {
  try {
    let { pair , risePrice, fallPrice } = req.body
    //let pair = symbol1.toUpperCase() + symbol2.toUpperCase()
    const response = await axios.get('https://api.binance.com/api/v3/ticker/price')
    const pairApi = response.data
    //console.log(pairApi)
    const pairExistence = pairApi.filter(c => c.symbol === pair )
    //console.log(pairExistence)
    if(!pairExistence.length) return res.status(404).json({message: 'Pair doesnt exists'})
    //await Pair.update({
    //  price: pairExistence[0].price
    //}
    //  ,{where : {
    //    pair: pairExistence[0].symbol
    //}})
    //console.log(pairDb.toJSON())
    //console.log(req.user.id, pairDb.toJSON().id)
    console.log(req.params.id, req.user.id)
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
    console.log(req.user.id, req.params.id)
    const unsubscription = await Susbcription.destroy({
      where: {
        userId: req.user.id,
        id: req.params.id
      }
    })
    if(!unsubscription) return res.json({msg: 'Subscription does not exists for this user'}) 
    res.json({message : 'Subscription eliminated'})
  }catch(err){
    res.status(500).json(err)
  }
})

module.exports = rSubscription
