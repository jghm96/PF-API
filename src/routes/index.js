const { Router } = require('express');
// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');
const user = require('./user')

const router = Router();

router.use('/user', user)

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);


module.exports = router;
