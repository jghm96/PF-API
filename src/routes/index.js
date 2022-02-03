const { Router } = require('express');
const login = require('./Login.js');
const signUp = require('./SignUp.js');
const cryptos = require('./Cryptos.js');
const million = require('./MillionGift.js');
const addSymbols = require("../AddSymbols.js");
const user = require('./user');
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
router.use('/user', user)
router.get("/logout",(req,res) => {
    req.logout();
    req.session.destroy();
    res.json({status:"session finished"})
})

module.exports = router;
