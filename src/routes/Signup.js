const { Router } = require('express');
const uuid = require('uuid');
const bcrypt = require("bcrypt");
const {User} = require('../db');

const signUp = Router();

signUp.post("/", async (req, res) => {
    let id = uuid.v4().toString();
    const {username, password,email} = req.body;
    try{
        let cryptPassword = await bcrypt.hash(password,10);
        await User.create({id,username,password: cryptPassword,email,balance: 10000});
        res.status(201).json({succes:"user create"});
    }catch(e){
       
       res.status(401).json(e);
    }
});


module.exports = signUp;

