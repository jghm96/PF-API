const { Router } = require('express');
// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');
const subs = require('./Subscription')
const login = require('./Login')
const signup = require('./Signup')
const addSymbols = require('../AddSymbols')
let emptySymbols = true

const router = Router();

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);
router.use('/signup', signup)
router.use('/login', login)
router.use('/subs', subs)

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
