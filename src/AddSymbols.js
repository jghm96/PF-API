const {Symbol} = require('./db');
const axios = require('axios');


const addSymbols = async () => {
    try{
        let criptos = (await axios.get(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=10s`)).data;
        await addDataInDb(criptos)
   }catch(e){
       return {error:"error in request"}
   }
}

const addDataInDb = async  (criptos) => {
  for(let i = 0; i < criptos.length; i++){
        await Symbol.findOrCreate({
            where:{
                symbol:criptos[i].symbol
            },
            defaults:{
                image:criptos[i].image,
            }
        });
  }
}


module.exports = addSymbols;

