const settings = require('express').Router()
const { isAuthenticated } = require('../JWT/JSONWT')
const { User } = require('../db')
const bcrypt = require('bcrypt')

settings.post('/', isAuthenticated, async (req, res) => {
  try{
    let { image, theme, password } = req.body
    const user = await User.findByPk(req.user.id)
    const newPassword = password ? await bcrypt.hash(password, 10) : null
    await user.update({
      password: newPassword ? newPassword : user.toJSON().password,
      theme: theme ? theme: '',
      image: image ? image: '',
    })
    let userMod = user.toJSON()
    userMod = {
      username: userMod.username,
      email: userMod.email,
      image: userMod.image,
      theme: userMod.theme,
    }
    res.json(userMod)
  }catch(err){
    res.status(500).json(err)
  }
})

module.exports = settings
