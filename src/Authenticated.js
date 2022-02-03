const isAuthenticated = (req,res,next) => {
    if(req.isAuthenticated())
     next()
     else
     res.json({error:"there is not session"});
}

module.exports = isAuthenticated;
