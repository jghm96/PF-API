const { Router } = require('express');
const millionGift = Router();
const isAuthenticated = require("../Authenticated");
const {addTransaction,getAllTransactions,getCryptosForUser} = require("../sinNombre/Transactions")

millionGift.get("/",isAuthenticated,async(req,res) => {
    addTransaction(req.user.id,900,"btc","deposit"); 
    res.status(200);
});

millionGift.get("/1",isAuthenticated,async(req,res) => {
    res.json(await getCryptosForUser(req.user.id))
});


millionGift.get("/all",isAuthenticated,async(req,res) => {
    res.json(await getAllTransactions(req.user.id))
});

module.exports = millionGift;