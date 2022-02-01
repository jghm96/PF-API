const express = require('express')
const user = express.Router()
const { User, Pair, Susbcription } = require('../db')

user.get('/', async (req, res) => {
  let {user} = req.body
  const subscriptions = await User.findAll({
    include: Susbcription,
    where:{
      username: user
    }
  })

  res.json(subscriptions)
})

user.post('/create', async (req, res) => {
  let {id, username, password, email, balance, userType, mobile} = req.body
  console.log(req.body)

  const userDb = await User.create({
    id,
    username,
    password,
    email,
    balance,
    userType,
    mobile
  })

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


  console.log(userDb)

  if(userDb) return res.json(user)
})

user.post('/subscribe', async (req, res) => {
  let { user, pair, priceRise, priceFall } = req.body
  console.log(req.body)
  try{
    if(user){
      const userBd = await User.findAll({
        where: {
          username: user
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

user.delete('/unsubscribe', async (req, res) => {
  let { user, pair } = req.body
  const userDb = await User.findOne({where: {username: user}}) //buscar usuario en BD
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
