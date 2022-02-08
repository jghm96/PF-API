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

const email = async (userEmail, subject, htmlSend) => 
  await transporter.sendMail({
 from: '"Crypto" <cryptohenryp@gmail.com>',
  to: userEmail,
  subject: subject,
  html: htmlSend
})

//Solo se importa la funcion email donde la quieras usar
//y le pasas en los parametros el email a donde lo vas
//a enviar, que en este caso se debe de extraer del user al 
//que estás queriendo avisar del precio, el subject
//es el asunto del correo, puede ponerse como
//Venta de Cripto, cuando alcance la alerta de risePrice
//o Compra de cripto cuando se alcance la de fallPrice,
//el htmlSend es lo que se va a mostrar en el correo
//con etiquetas html, puedes usar img, h1 lo que sea,
//para darle estilo al correo, hasta le puedes agregar un 
//link de la página para que del correo lo redirija a
//comprar o vender segun sea el caso.


//Para mandar el correo se debe importar transporter en el archivo donde se va a usar y ejecutar la siguiente función
/*await transporter.sendMail({
      from: '"Crypto" <cryptohenryp@gmail.com>', //Quien manda el correo en este caso es un correo creado con el usuario y contraseña dentro del archivo .env
      to: req.user.email, //email del usuario que esta loggeado
      subject:"Mensaje de prueba", // Subject del correo
      //text: "Prueba de correo",
      html: `<h1>Hola</h1>`, //Codigo hmtl que quieres que se muestre en el correo
    })
    */

module.exports = email
