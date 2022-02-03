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
        username: req.user.username
      },
      attributes: ['username', 'email', 'balance'],
      include: Susbcription
    })
    console.log(subscriptions)

    res.json(subscriptions)
  
  }catch(err){
    res.status(500).json(err)
  }
})

rSubscription.post('/subscribe', isAuthenticated ,async (req, res) => { //Ruta para subscripcion a cryptos que existan en la BD
  let {symbols, priceRise, priceFall } = req.body
  
  try{
    if(req.user){
      const userBd = await User.findAll({
        where: {
          username: req.user.username
        }
      })
      if(!userBd) return res.json({msg: 'No existe el usuario'})
      
      const pair = symbols[0].toUpperCase() + symbols[1].toUpperCase()

      const response = await axios.get('https://api.binance.com/api/v3/ticker/price')
      const pairApi= response.data
      const existence = pairApi.filter(c => c.symbol === pair)
      
      if(!existence.length) return res.status(404).json({message : 'Pair no valido'})
      
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
          fallPrice: priceFall || 0,
          risePrice: priceRise || 0,
          alertOnRise: priceRise ? true : false,
          alertOnFall: priceFall ? true : false    
        }
      }) 
      if(!createds) return res.json({message : 'Subscription has been done earlier'})
      await subscription.setUser(userBd[0])
      await subscription.setPair(pairDb)
      res.json({msg : 'Subscription done'})
    }else{
      res.status(404).json({msg : 'Error de usuario'})
    }
  }catch(err){
    res.status(500).json(err)
  }

})

rSubscription.delete('/unsubscribe', isAuthenticated,async (req, res) => { //Ruta para desuscribirse de una crypto que un usuario haya tenido como subscripcion
  try {
  let { symbols } = req.body
    const pair = symbols[0].toUpperCase() + symbols[1].toUpperCase()
  const userDb = await User.findOne({where: {username: req.user.username}}) //buscar usuario en BD
  const pairDb = await Pair.findOne({where: {pair: pair}}) // buscar Pair en BD
  if(!pairDb) return res.status(404).json({msg: 'No existe el pair'})
  const unsubscription = await Susbcription.destroy({
    where: {
      userId: userDb.dataValues.id,
      pairId: pairDb.dataValues.id
    }
  })
  if(!unsubscription) return res.json({msg: 'No existe la suscripcion'}) 
  res.json(unsubscription)
  }catch(err){
    res.status(500).json(err)
  }
})

module.exports = rSubscription
