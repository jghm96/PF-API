const { Router } = require('express');
const cryptos = Router();
const axios = require('axios');

// tipo de criptos para el front 
cryptos.get("/:contrapart", async(req,res) => {
    let criptos;
    const {contrapart} = req.params;
    try{
         criptos = (await axios.get(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=${contrapart}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=10s`)).data;
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
        res.status(404);
    }
     
});


module.exports = cryptos;