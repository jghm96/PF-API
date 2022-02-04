const { Router } = require('express');

const subs = require('./Subscription')
const login = require('./Login.js');
const signUp = require('./Signup.js');
const cryptos = require('./Cryptos.js');
const million = require('./MillionGift.js');
const symbols = require("../sinNombre/Symbols.js");
let emptySymbols=true;

if(emptySymbols){
    symbols();
    emptySymbols = false;
}
  
const router = Router();



router.use("/signup",signUp);
router.use("/login",login);
router.use("/cryptos",cryptos);
router.use("/million",million);
router.use('/subs', subs)

router.get("/logout",(req,res) => {
    req.logout();
    req.session.destroy();
    res.json({status:"session finished"})
})

module.exports = router;
