require('dotenv').config()
const jwt = require('jsonwebtoken')


const userToken = (id, username) => {
    const user = {
        id,
        username
    }
    const token = jwt.sign(user, process.env.JWT_TOKEN_SECRET)
    return token
}

const isAuthenticated = (req, res, next) => {
    try{
        const authorization = req.get('Authorization')
        let token = 'Sin token'
        if(authorization && authorization.toLowerCase().startsWith('bearer')){
            token = authorization.substring(7)
        }
        
        const decodedToken = jwt.verify(token, process.env.JWT_TOKEN_SECRET)

        req.user = decodedToken
        next()


    }catch(err){
        res.status(500).json(err)
    }
}

module.exports = { isAuthenticated, userToken }
