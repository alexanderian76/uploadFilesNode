const jwt = require('jsonwebtoken')

module.exports = function (req, res, next) {
    if(req.method === 'OPTIONS') {
        next()
    }

    try {
        console.log(req.headers)
        const token = req.headers.authorization.split(' ')[1]
        
        if(!token) {
            res.status(401).json({message: "No token"})
        }
        const decoded = jwt.verify(token, process.env.SECRET_KEY)
       // console.log(decoded)
        req.user = decoded
        
        next()
    } 
    catch(e) {
        res.status(401).json({message: "User dont auth"})
    }
}