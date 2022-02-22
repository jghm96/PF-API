const bcrypt = require('bcrypt')
const login = require('express').Router()
const { User } = require('../db')
const {Op} = require('sequelize')
const passport = require('passport')
const { userToken } = require('../JWT/JSONWT')

login.post('/', async(req, res) => {
  try{
    const { username, password } = req.body
    let user =  await User.findOne({
      where: {
        [Op.or]: [{username: username}, {email: username}]
      }
    })
    console.log(user)
    const passwordCorrect = user === null ? false : await bcrypt.compare(password, user.toJSON().password)
    if(!passwordCorrect) return res.status(401).json({errorType:'userError', errorCode:'1110' , errorMessage: 'Invalid user or password'})
    const tokenUser=userToken(user.toJSON().id, user.toJSON().username)
    res.json({username : user.toJSON().username, email: user.toJSON().email, image: user.toJSON().image, theme: user.toJSON().theme, tokenUser})
  }catch(err){
    res.status(500).json(err)
  }
})

login.get("/google", passport.authenticate("google",{scope:["profile","email"]}),(req,res) => {
  res.json(req)
});

login.get("/googlecallback", 
  passport.authenticate("google",{
    failureRedirect:'http://localhost:3000/signin'
}), 
  (req, res) => {
    req.user = req.user
    return res.redirect('http://localhost:3000/')
});

module.exports = login
