const nodemailer = require('nodemailer')
require('dotenv').config()



const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: `${process.env.MAILUSER}`,
      pass: `${process.env.MAILPASSWORD}`
    }
  })

transporter.verify().then(() => {
  console.log('Ready for send emails')
})




module.exports = transporter
