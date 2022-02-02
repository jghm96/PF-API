const { Router } = require('express');
const login = require('./Login.js');
const signUp = require('./SignUp.js');
const cryptos = require('./Cryptos.js');
const transaction = require('./Transaction.js');
const million = require('./MillionGift.js');
const addSymbols = require("../AddSymbols.js");
let emptySymbols=true;

const user = require('./user')
const router = Router();

router.use("/signup",signUp);
router.use("/login",login);
router.use("/cryptos",cryptos);
router.use("/transaction",transaction);
router.use("/million",million);
router.use('/user', user)

if(emptySymbols){
    addSymbols();
    emptySymbols = false;
}
  
router.get("/logout",(req,res) => {
    req.logout();
    req.session.destroy();
    res.json({status:"session finished"})
})

module.exports = router;
