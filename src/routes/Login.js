const { Router } = require('express');
const passport = require('passport');

const login = Router();


login.post('/',passport.authenticate('local',{
    successRedirect:"/login/success",
    failureRedirect: "/login/error",
}))


login.get("/google", passport.authenticate("google",{scope:["profile","email"]}));

login.get("/googlecallback", passport.authenticate("google",{
    successRedirect:'/login/success',
    failureRedirect:'/login/error',

}));

login.get('/success',(req,res) => {
    res.json({isAuthenticated:true,username:req.user.name});
});

login.get('/error',(req,res) => {
    res.status(490).json({isAuthenticated:false,username:""})
});

