user.get('/email', isAuthenticated, async (req, res) => {
  console.log(req.user.email)
  try{
    await transporter.sendMail({
      from: '"Crypto" <cryptohenryp@gmail.com>',
      to: req.user.email, //email del usuario que esta loggeado
      subject:"Mensaje de prueba", // Subject del correo
      //text: "Prueba de correo",
      html: `<h1>Hola</h1>`, //Codigo hmtl que quieres que se muestre en el correo
    })
    res.json({message: 'Email send'})
  }catch(e){
    console.log(e)
    return res.status(400).json({message: 'Something goes wrong'})
  }
})

user.post('/create', isAuthenticated,async (req, res) => { //Ruta para crear en la BD registros para trabajar sin la api
  try{
    let {password, email, balance, userType, mobile} = req.body
    const {username, id} = req.user

    await Pair.create({
      id: 0,
      price: 1000,
      pair: 'asdasd'
    })
    await Pair.create({
      id: 1,
      price: 1000,
      pair: 'asdfds'
    })  
    return res.json(username)
  }catch(err){
    res.status(500).json(err)
  }
})
