const { Router } = require('express')
const { isAuthenticated } = require('../JWT/JSONWT')
const { Pair, Susbcription } = require('../db')
const axios = require('axios')

/*------------------Imports----------------------*/

const pair = Router()

pair.get('/',async (req, res) => {
  try{
    const response = await axios.get('https://api.binance.com/api/v3/ticker/price')
                            .then(response => response.data)
    await response.forEach(async s => {
      await Pair.update({
        price: s.price
      },{
        where: {
          pair: s.symbol
        }
      })
    })
    const pairActualizados = await Pair.findAll({
      attributes: ['id','price','pair']
    })
    res.json(pairActualizados)

  }catch(err){
    res.status(500).json(err)
  }
})

pair.get('/prices', isAuthenticated, async (req, res) => {
  try{
    const pairSubscriptos = await Susbcription.findAll({
      where: {
        userId: req.user.id
      },
      attributes: ['pairId'],
      include: [{model: Pair, attributes: ['price']}]
    })
    const format = pairSubscriptos.map(p => (
      {
        pairId: p.pairId,
        price: p.pair.price
      }
    ))
    res.json(format)
  }catch(err){
    res.status(500).json(err)
  }
})

pair.get('/price/:id', async (req, res) => {
  try{
    const price = await Pair.findByPk(req.params.id)
    if(!price) return res.status(404).json({message: 'Pair not found'})
    const format = {
      pairId: price.toJSON().id,
      price: price.toJSON().price
    }
    res.json(format)
  }catch(err){
    res.status(500).json(err)
  }
})

module.exports = pair