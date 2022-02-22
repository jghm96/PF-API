const { Router } = require('express');
const uuid = require('uuid');
const bcrypt = require("bcrypt");
const { User, Symbol, Transaction } = require('../db');
const { Op } = require('sequelize')

const signUp = Router();

signUp.post("/", async (req, res) => {
    let id = uuid.v4().toString();
    const {username, password, email} = req.body;
    try{
        
        let cryptPassword = await bcrypt.hash(password,10);
        const findUser = await User.findOne({
            where:{
                username
            }
        })
        const findEmail = await User.findOne({
            where: {
                email
            }
        })
        if(findUser || findEmail){
            findUser && findEmail ? res.status(490).send({errorType:'SignUp', errorCode:'1010' ,errorMessage:"username e email existentes"}) :
                findUser ? res.status(490).json({errorType:'SignUp', errorCode:'1010' , errorMessage: 'username existente'}) :
                res.status(490).json({errorType:'SignUp', errorCode:'1010' , errorMessage: 'email existente'});
        }
        else{
            const user = await User.create({id,username,password: cryptPassword,email,theme: null, image: ''});
         let symbol = await Symbol.findByPk(3)
            let transactionFree = await Transaction.create({withdraw: 0, deposit:1000000})
            await user.addTransaction(transactionFree)
            await symbol.addTransaction(transactionFree)
          res.json({message:"user create"});
        }
    }catch(e){
       console.log(e);
       res.status(500).json(e);
    }
});

signUp.get('/users', async (req, res) => {
    try{
        const find = await User.findAll({
            attributes: ['username', 'email']
        })
        res.json(find)
    }catch(err){
        res.status(500).json(err)
    }
})


module.exports = signUp;


