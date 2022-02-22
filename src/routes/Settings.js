const settings = require('express').Router()
const { isAuthenticated } = require('../JWT/JSONWT')
const { User } = require('../db')
const bcrypt = require('bcrypt')

settings.post('/', isAuthenticated, async (req, res) => {
  try{
    let { image, theme, passwordChange, lastPassword, newPassword } = req.body
    const user = await User.findByPk(req.user.id)
    const match = await bcrypt.compare(lastPassword, user.toJSON().password)
    console.log(match)
    if(passwordChange && !match) return res.status(404).json({errorType: 'errorUser', errorCode: '1150', errorMessage:'Password do not match with the registry'});
    const newPassword2 = passwordChange ? await bcrypt.hash(newPassword, 10) : null
    await user.update({
      password: newPassword2 ? newPassword2 : user.toJSON().password,
      theme: theme !== user.toJSON().theme ? theme : user.toJSON().theme,
      image: image ? image: user.toJSON().image,
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
