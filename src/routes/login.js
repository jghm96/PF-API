const { Router } = require('express');
const passport = require('passport');

const login = Router();

login.post('/',passport.authenticate("local",{
    successRedirect:"/login/success",
    failureRedirect: "/login/error",
    failureMessage:true
}))

login.get('/success',(req,res) => {
    res.json({success:"user is login"});
});

login.get('/error',(req,res) => {
    res.json({error:req.session.messages[0]})
});



module.exports = login;
