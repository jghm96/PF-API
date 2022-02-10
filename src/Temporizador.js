const cron = require('node-cron')
const axios = require('axios')
const { User, Susbcription } = require('./db.js')
const {Op} = require('sequelize')
const email = require('./Mail.js')

module.exports = cron.schedule('* * * * *', async () => {
    const response = await axios.get(`${process.env.SERVER_URL}/pair`)
    let subscriptionsReview =  await Susbcription.findAll({where: {
        [Op.or] : [{alertOnRise: true}, {alertOnFall: true}]
        }})
    subscriptionsReview = subscriptionsReview.map((s) => s.toJSON() )
    subscriptionsReview.forEach(async s => {
        let pair = response.data.filter(sub => sub.id === s.pairId)
        console.log(pair)
        if(s.alertOnRise){
            if(s.risePrice < pair[0].price){
                let alertOnRise= false;
                const user = await User.findByPk(s.userId)
                const subject = `Henry Coin alert`
                const sendHtml = `<div><h1>This message was automatically sended to inform you that price of ${pair[0].pair} is ${pair[0].price}.</h1>
                    <h3>Your settings</h3>
                    <ul>
                        <li>risePrice: ${s.risePrice}</li>
                        <li>fallPrice: ${s.fallPrice}</li>
                    </ul>
                    <a href='${process.env.SERVER_URL}/'>Vende</a>
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
            if(s.fallPrice > pair[0].price ){
                let alertOnFall= false;
                const user = await User.findByPk(s.userId)
                const subject = `Henry Coin alert`
                const sendHtml = `<div><h1>This message was automatically sended to inform you that price of ${pair[0].pair} is ${pair[0].price}.</h1>
                    <h3>Your settings</h3>
                    <ul>
                        <li>risePrice: ${s.risePrice}</li>
                        <li>fallPrice: ${s.fallPrice}</li>
                    </ul>
                    <a href='${process.env.SERVER_URL}/'>Compra</a>
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
