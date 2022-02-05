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
        const find = await User.findOne({
            where:{
                [Op.or]:[{username},{email}]
            }
        })
        if(find)
          res.status(490).send({error:"username o email existentes"});
        else{
          await User.create({id,username,password: cryptPassword,email});
          res.status(201).json({succes:"user create"});
        }
    }catch(e){
       console.log(e);
       res.status(401).json(e);
    }
});


module.exports = signUp;


