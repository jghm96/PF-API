const { Router } = require('express');

const login = require('./login.js');
const signUp = require('./signUp.js');
//const cryptos = require('./Cryptos.js');
//const transaction = require('./Transaction.js')
const user = require('./user')

const router = Router();

router.use("/signup",signUp);
router.use("/login",login);
//router.use("/cryptos",cryptos);
//router.use("/transaction",transaction);
router.use('/user', user)

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);


module.exports = router;
