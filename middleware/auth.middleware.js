const jwt = require("jsonwebtoken")
require("dotenv").config()

const auth = (req,res,next) => {
    const token = req.headers.authorization?.split(" ")[1]
    if(token){
        try{
            const decoded = jwt.verify(token, process.env.secret)
            if(decoded){
                req.body.user =   decoded.user ;
                req.body.userID =  decoded.userID ;
              
                next()
            }else{
                res.status(404).json({msg:"Not Authorized"})
            }
        }catch(err){
            res.status(404).json({msg:"Something wrong Please Login Again"})
        }
    }else{
        res.status(404).json({msg:"Please Login First!"})
    }
}

module.exports={auth}