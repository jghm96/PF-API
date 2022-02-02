const { Router } = require('express');
const passport = require('passport');

const login = Router();

login.post('/',passport.authenticate('local',{
    successRedirect:"/login/success",
    failureRedirect: "/login/error",
    failureMessage:true
}))

login.get("/google", passport.authenticate("google",{scope:["profile","email"]}));

login.get("/googlecallback", passport.authenticate("google",{
    successRedirect:'/login/success',
    failureRedirect:'/login/error',

}));

login.get('/success',(req,res) => {
    res.json({success:"user is login"});
});

login.get('/error',(req,res) => {
    res.json({error:req.session.messages[0]})
});



module.exports = login;