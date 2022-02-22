const cron = require('node-cron')
const axios = require('axios')
const { User, Susbcription, Symbol, Pair } = require('./db.js')
const {Op} = require('sequelize')
const email = require('./Mail.js')

module.exports = cron.schedule('* * * * *', async () => {
    const response = await axios.get(`${process.env.SERVER_URL}/pair`)
    let subscriptionsReview =  await Susbcription.findAll({where: {
        [Op.or] : [{alertOnRise: true}, {alertOnFall: true}],
        },
        include: [{model: Pair}]
    })
    subscriptionsReview = subscriptionsReview.map((s) => s.toJSON() )
    subscriptionsReview.forEach(async s => {
        //let pair = response.data.filter(sub => sub.id === s.pairId)
        if(s.alertOnRise){
            let precio = s.pair.symbol1Id === s.symbol1Id ? s.pair.price : (1/s.pair.price) 
            if(s.risePrice <= precio){
                let alertOnRise = false;
                let symbol1 = await Symbol.findByPk(s.symbol1Id)
                let symbol2 = await Symbol.findByPk(s.symbol2Id)
                symbol1 = symbol1.toJSON()
                symbol2 = symbol2.toJSON()
                const user = await User.findByPk(s.userId)
                const subject = `Rise alarm triggered for ${symbol1.symbol}`
                const sendHtml = `<div>
                    <h1>Your rise alarm for ${symbol1.symbol} vs ${symbol2.symbol} was triggered at ${s.pair.symbol1Id === symbol1.id ? s.pair.price : (1/s.pair.price)}</h1>
                    <h3>Your settings</h3>
                    <ul>
                        <li>risePrice: ${s.risePrice}</li>
                        <li>fallPrice: ${s.fallPrice}</li>
                    </ul>
                    <a href='${process.env.CLIENT_URL}/'>Vende</a>
                    </div>`
                await email(user.toJSON().email, subject, sendHtml)
                await Susbcription.update({
                        alertOnRise
                    },{
                        where: {
                        id: s.id
                    }
                })
            }
        }
        if(s.alertOnFall){
            let precio = s.pair.symbol1Id === s.symbol1Id ? s.pair.price : (1/s.pair.price)
            if(s.fallPrice >= precio ){
                let alertOnFall= false;
                let symbol1 = await Symbol.findByPk(s.symbol1Id)
                let symbol2 = await Symbol.findByPk(s.symbol2Id)
                symbol1 = symbol1.toJSON()
                symbol2 = symbol2.toJSON()
                const user = await User.findByPk(s.userId)
                const subject = `Fall alarm triggered for ${symbol1.symbol}`
                const sendHtml = `<div>
                    <h1>Your fall alarm for ${symbol1.symbol} vs ${symbol2.symbol} was triggered at ${s.pair.symbol1Id === symbol1.id ? s.pair.price : (1/s.pair.price)}</h1>
                    <h3>Your settings</h3>
                    <ul>
                        <li>risePrice: ${s.risePrice}</li>
                        <li>fallPrice: ${s.fallPrice}</li>
                    </ul>
                    <a href='${process.env.CLIENT_URL}/'>Compra</a>
                    </div>`
                await email(user.toJSON().email, subject, sendHtml)
                await Susbcription.update({
                        alertOnFall
                    },
                    {
                        where: {
                            id: s.id
                        }
                    })
            }
        }
    } )
})
