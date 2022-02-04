const passport = require('passport');
//require("./GoogleStrategy.js");
require("./LocalStrategy.js");


passport.serializeUser((user,done) => {
    done(null,user);
})

passport.deserializeUser((user,done) => {
   done(null,user);
});
