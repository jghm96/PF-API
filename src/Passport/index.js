const passport = require('passport');
require("./LocalStrategy.js");


passport.serializeUser((user,done) => {
    done(null,user);
})

passport.deserializeUser((user,done) => {
   done(null,user);
});
