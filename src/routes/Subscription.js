const express = require('express')
const rSubscription = express.Router()
const { Symbol, User, Pair, Susbcription } = require('../db')
const isAuthenticated = require('../Authenticated')
const transporter = require('../Mail')
const axios = require('axios')

rSubscription.get('/', isAuthenticated ,async (req, res) => {
  try{
    console.log(req.user.username)
    const user = req.user.username 
    const subscriptions = await User.findAll({
      where:{
        username: user
      },
      attributes: ['username', 'email'],
      include: Susbcription
    })
    console.log(subscriptions)

    res.json(subscriptions)
  
  }catch(err){
    res.status(500).json(err)
  }
})

rSubscription.post('/subscribe', isAuthenticated ,async (req, res) => { //Ruta para subscripcion a cryptos que existan en la BD
  let {symbols, risePrice, fallPrice } = req.body
  
  try{
    if(req.user){
      const userBd = await User.findAll({
        where: {
          username: req.user.username
        }
      })
      if(!userBd) return res.json({msg: 'User does not exists on BD'})
      
      const pair = symbols[0].toUpperCase() + symbols[1].toUpperCase()

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
          fallPrice: fallPrice || 0,
          risePrice: risePrice || 0,
          alertOnRise: risePrice ? true : false,
          alertOnFall: fallPrice ? true : false    
        }
      }) 
      if(!createds) return res.json({message : 'Subscription exists already'})
      await subscription.setUser(userBd[0])
      await subscription.setPair(pairDb)
      res.json({msg : 'Subscription done'})
    }else{
      res.status(404).json({msg : 'User error'})
    }
  }catch(err){
    res.status(500).json(err)
  }

})

rSubscription.put('/subscribe', isAuthenticated, async (req, res) => {
  try {
    let { symbols, risePrice, fallPrice } = req.body
    let pair = symbols[0].toUpperCase() + symbols[1].toUpperCase()
    const response = await axios.get('https://api.binance.com/api/v3/ticker/price')
    const pairApi = response.data
    console.log(pairApi)
    const pairExistence = pairApi.filter(c => c.symbol === pair)
    console.log(pairExistence)
    if(!pairExistence.length) return res.status(404).json({message: 'Pair doesnt exists'})
    const pairDb = await Pair.findOne({
      where : {
        pair: pairExistence[0].symbol
      }
    })
    console.log(pairDb.toJSON())
    console.log(req.user.id, pairDb.toJSON().id)
    await Susbcription.update({
      price: pairExistence.price,
      risePrice,
      fallPrice,
      alertOnFall: fallPrice ? true : false,
      alertOnRise: risePrice ? true : false
    }, {
      where:{
        userId : req.user.id,
        pairId: pairDb.toJSON().id
      }
    })


    res.json({update: 'ok'})
    
  }catch(err){
    res.status(500).json(err)
  }
})

rSubscription.delete('/subscribe', isAuthenticated,async (req, res) => { //Ruta para desuscribirse de una crypto que un usuario haya tenido como subscripcion
  try {
  let { symbols } = req.body
    const pair = symbols[0].toUpperCase() + symbols[1].toUpperCase()
    const pairDb = await Pair.findOne({where: {pair: pair}}) // buscar Pair en BD
    if(!pairDb) return res.status(404).json({msg: 'Pair does not exists'})
    const unsubscription = await Susbcription.destroy({
      where: {
        userId: req.user.id,
        pairId: pairDb.dataValues.id
      }
    })
    if(!unsubscription) return res.json({msg: 'Subscription does not exists for this user'}) 
    res.json(unsubscription)
  }catch(err){
    res.status(500).json(err)
  }
})

module.exports = rSubscription
