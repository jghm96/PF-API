const isAuthenticated = (req,res,next) => {
    if(req.isAuthenticated())
     next()
     else
     res.status(404).json({error:"there is not session"});
}


module.exports = isAuthenticated;

