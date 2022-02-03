const { Router } = require('express');
<<<<<<< Updated upstream
// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');
=======
const login = require('./Login.js');
const signUp = require('./Signup.js');
const cryptos = require('./Cryptos.js');
//const transaction = require('./Transaction.js');
const million = require('./MillionGift.js');
const addSymbols = require("../AddSymbols.js");
let emptySymbols=true;

>>>>>>> Stashed changes
const user = require('./user')

const router = Router();

<<<<<<< Updated upstream
=======
router.use("/signup",signUp);
router.use("/login",login);
router.use("/cryptos",cryptos);
//router.use("/transaction",transaction);
router.use("/million",million);
>>>>>>> Stashed changes
router.use('/user', user)

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);


module.exports = router;
