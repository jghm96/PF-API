const passport = require('passport');
const localStrategy = require('passport-local').Strategy
const {User} = require('../db');
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");

passport.use('local', new localStrategy({
    usernameField:'username',
    passwordField:'password'
}, async (username,password,done) => {
   let user =  await User.findOne({
        where:{
         [Op.or]:[{username:username},{email:username}]
        }
    });
   if(!user)
    return done(null,false);
   else{
       if(!await bcrypt.compare(password,user.password))
         return done(null,false)
   }
   return done(null,user);
}))
