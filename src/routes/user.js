const express = require('express')
const user = express.Router()
const { User, Pair, Susbcription } = require('../db')
const isAuthenticated = require('../Authenticated')
const transporter = require('../Mail')


user.get('/usuario', isAuthenticated, (req, res) => {
  res.json(req.user)
})

user.get('/', isAuthenticated ,async (req, res) => {
  try{
    const user = req.user.username 
    const subscriptions = await User.findAll({
      include: Susbcription,
      where:{
        username: user
      }
    })

    res.json(subscriptions)
  
  }catch(err){
    res.send(500).json(err)
  }
})



user.post('/subscribe', isAuthenticated ,async (req, res) => { //Ruta para subscripcion a cryptos que existan en la BD
  let {pair, priceRise, priceFall } = req.body

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
    res.status(500).json(err)
  }

})

user.delete('/unsubscribe', isAuthenticated,async (req, res) => { //Ruta para desuscribirse de una crypto que un usuario haya tenido como subscripcion
  let { pair } = req.body
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

})

module.exports = user
