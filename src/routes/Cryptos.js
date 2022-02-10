const { Router } = require('express');
const axios = require('axios');
const {Symbol} = require("../db");
const cryptos = Router();

cryptos.get("/symbols", async (req,res) => {
    let symbols = ( await Symbol.findAll({attributes: ["id","symbol","image"]}))
  if(!symbols) return res.status(404).json({
    errorType:'symbolsError',
    errorCode:'1450',
    errorMessage: 'Symbols DB empty'
  })
   res.json(symbols)
})

// tipo de criptos para el front 

cryptos.get("/:contrapart", async(req,res) => {
    const {contrapart} = req.params;
    try{
      let criptos = (await axios.get(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=${contrapart}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=10s`)).data;
      if(!criptos) return res.status(404).json({errorType:'symbolsError', errorCode:'1410', errorMessage:'Symbols route not found'})
      res.json(criptos.map(cripto => {
                return {
                  id:cripto.id,
                  symbol:cripto.symbol,
                  name:cripto.name,
                  image:cripto.image,
                  price:cripto.current_price,
                  market_cap:cripto.market_cap,
                  price_change_percentage_24h:cripto.price_change_percentage_24h,
                  market_cap_change_percentage_24h:cripto.market_cap_change_percentage_24h, 
                  }
            }));
    }catch(e){
        res.status(500).json(e);
    }
});

module.exports = cryptos;
