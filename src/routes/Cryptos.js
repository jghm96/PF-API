const { Router } = require('express');
const axios = require('axios');
const {Symbol} = require("../db");
const cryptos = Router();

cryptos.get("/symbols", async (req,res) => {
    let symbols = ( await Symbol.findAll({attributes: ["id","symbol"]})).sort((a,b) => a.symbol > b.symbol?1: b.symbol > a.symbol ? -1 : 0)
   res.json(symbols)
})

// tipo de criptos para el front 

cryptos.get("/:contrapart", async(req,res) => {
    const {contrapart} = req.params;
    try{
      let criptos = (await axios.get(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=${contrapart}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=10s`)).data;
      res.json(criptos.map(cripto => {
                return {
                  id:cripto.id,
                  symbol:cripto.symbol,
                  name:cripto.name,
                  image:cripto.image,
                  price:cripto.current_price
                  }
            }));
    }catch(e){
        res.status(401);
    }
});

module.exports = cryptos;