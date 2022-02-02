const { Router } = require('express');
const login = require('./Login.js')
const signUp = require('./SignUp.js')
const cryptos = require('./Cryptos.js')
// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');


const router = Router();

router.use("/signup",signUp);
router.use("/login",login);
router.use("/cryptos",cryptos);

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);


router.get("/logout",(req,res) => {
    req.logout();
    req.session.destroy();
    res.json({status:"session finished"})
})

module.exports = router;
