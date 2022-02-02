const { Router } = require('express');
const {Transaction,Symbol,User} = require("../db");
const millionGift = Router();
const isAuthenticated = require("../Authenticated");

millionGift.get("/",isAuthenticated,async(req,res) => {
    let usdt = await Symbol.findOne({where:{symbol:"usdt"}});
    let oneMillion = await Transaction.create({deposit:100000});
    let user = await User.findByPk(req.user.id);
    usdt.addTransaction(oneMillion);
    user.addTransaction(oneMillion);
    res.json({message:"you have one millon usdt"});
});


module.exports = millionGift;