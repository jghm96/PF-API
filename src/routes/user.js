const express = require('express')
const user = express.Router()
const { User, Pair, Susbcription } = require('../db')
const isAuthenticated = require('../Authenticated')

user.get('/hola', isAuthenticated, (req, res) => {
  res.json(req.user)
})

user.get('/', isAuthenticated ,async (req, res) => {
  const user = req.user.username 
  const subscriptions = await User.findAll({
    include: Susbcription,
    where:{
      username: user
    }
  })

  res.json(subscriptions)
})

user.post('/create', isAuthenticated,async (req, res) => {
  let {password, email, balance, userType, mobile} = req.body
  console.log(req.body)

  const {username, id} = req.user


  const par = await Pair.create({
    id: 0,
    price: 1000,
    pair: 'asdasd'
  })
 await Pair.create({
    id: 1,
    price: 1000,
    pair: 'asdfds'
  })


  return res.json(username)
})

user.post('/subscribe', isAuthenticated ,async (req, res) => {
  let {pair, priceRise, priceFall } = req.body
  console.log(req.body)
  try{
    if(user){
      const userBd = await User.findAll({
        where: {
          username: req.user.username
        }
      })
      if(!userBd) return res.json({msg: 'No existe el usuario'})

      const pairBd = await Pair.findAll({
        where: {
          pair: pair
        }
      }) 
      if(!pairBd) return res.json({msg : 'No existe el pair'})

      const subscription = await Susbcription.create({
        fallPrice: priceFall || 0,
        risePrice: priceRise || 0,
        alertOnRise: priceRise ? true : false,
        alertOnFall: priceFall ? true : false    
      }) 

     await subscription.setUser(userBd[0].dataValues.id)
      console.log(pairBd)
      await subscription.setPair(pairBd[0].dataValues.id)
      res.json({msg : 'Subscription done'})
    }else{
      res.status(404).json({msg : 'Error de usuario'})
    }
  }catch(err){
    console.log(err)
  }

})

user.delete('/unsubscribe', isAuthenticated,async (req, res) => {
  let { pair } = req.body
  const userDb = await User.findOne({where: {username: req.user.username}}) //buscar usuario en BD
  const pairDb = await Pair.findOne({where: {pair: pair}}) // buscar Pair en BD
  const unsubscription = await Susbcription.destroy({
    where: {
      userId: userDb.dataValues.id,
      pairId: pairDb.dataValues.id
    }
  })
  if(!unsubscription) return res.json({msg: 'No existe la suscripcion'}) 
  res.json(unsubscription)

})

module.exports = user
