const { Router } = require('express');

const subs = require('./Subscription')
//const user = require('./user')
const login = require('./LoginJWT');
const signUp = require('./Signup.js');
const cryptos = require('./Cryptos.js');
const million = require('./MillionGift.js');
const pair = require('./Pair')
const addSymbols = require("../AddSymbols.js");
let emptySymbols=true;

if(emptySymbols){
    addSymbols();
    emptySymbols = false;
}
  
const router = Router();



router.use("/signup",signUp);
router.use("/login",login);
router.use("/cryptos",cryptos);
router.use("/million",million);
router.use('/subs', subs)
router.use('/pair', pair)
//router.use('/user', user)

router.get("/logout",(req,res) => {
    req.logout();
    req.session.destroy();
    res.json({status:"session finished"})
})

module.exports = router;
