const passport = require('passport');
const {User} = require('../db');
const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
const bcrypt = require("bcrypt");
const {
    GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET
  } = process.env;

passport.use('google',new GoogleStrategy({
    clientID:     GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3001/login/googlecallback",
    passReqToCallback: true
  },
   async (request, accessToken, refreshToken, profile, done) => {
    let id = profile.id.toString();
    let password = await bcrypt.hash(GOOGLE_CLIENT_ID,10);
    const [user,create] = await User.findOrCreate({
        where:{id},
        defaults:{
            id,
            username:profile.displayName,
            email:profile.email,
            password
        }
    })
    return done(null,user);
  }
));