const bcrypt = require('bcrypt')
const login = require('express').Router()
const { User } = require('../db')
const {Op} = require('sequelize')
const { userToken } = require('../JWT/JSONWT')

login.post('/', async(req, res) => {
  try{
    const { username, password } = req.body

    let user =  await User.findOne({
      where: {
        [Op.or]: [{username: username}, {email: username}]
      }
    })
    
    const passwordCorrect = user === null ? false : await bcrypt.compare(password, user.toJSON().password)
    if(!passwordCorrect) return res.status(401).json({message: 'Invalid user or password'})
    console.log(userToken)
    const tokenUser=userToken(user.toJSON().id, user.toJSON().username)
    res.json({username : user.toJSON().username, email: user.toJSON().email, tokenUser})
  }catch(err){
    res.status(500).json(err)
  }
})

module.exports = login
