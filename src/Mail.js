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

//Para mandar el correo se debe importar transporter en el archivo donde se va a usar y ejecutar la siguiente función
/*await transporter.sendMail({
      from: '"Crypto" <cryptohenryp@gmail.com>', //Quien manda el correo en este caso es un correo creado con el usuario y contraseña dentro del archivo .env
      to: req.user.email, //email del usuario que esta loggeado
      subject:"Mensaje de prueba", // Subject del correo
      //text: "Prueba de correo",
      html: `<h1>Hola</h1>`, //Codigo hmtl que quieres que se muestre en el correo
    })
    */

module.exports = transporter
