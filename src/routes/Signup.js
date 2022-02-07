const { Router } = require('express');
const uuid = require('uuid');
const bcrypt = require("bcrypt");
const {User} = require('../db');
const { Op } = require('sequelize')

const signUp = Router();

signUp.post("/", async (req, res) => {
    let id = uuid.v4().toString();
    const {username, password,email} = req.body;
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
            findUser && findEmail ? res.status(490).send({error:"username e email existentes"}) :
                findUser ? res.status(490).json({error: 'username existente'}) :
                res.status(490).json({error: 'email existente'});
        }
        else{
          await User.create({id,username,password: cryptPassword,email});
          res.status(201).json({succes:"user create"});
        }
    }catch(e){
       console.log(e);
       res.status(401).json(e);
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


