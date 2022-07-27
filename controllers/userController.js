const ApiError = require('../error/ApiError');
const bcrypt = require('bcrypt')
const {User} = require('../models/models')
const jwt = require('jsonwebtoken')


const generateJwt = (id, email, role) => {
    //console.log(process.env.SECRET_KEY)
    return jwt.sign({id: id, email, role}, process.env.SECRET_KEY, {expiresIn: '24h'})
}

class UserController {
    async registration(req, res, next) {
        console.log(req.body)
        const {email, password, role} = req.body

        if(!email || !password)
        {
            return next(ApiError.badRequest('Incorrect password or email'))
        }
        const candidate = await User.findOne({where : {email}})
        if(candidate) {
            return next(ApiError.badRequest('User already exists'))
        }

        const hashPassword = await bcrypt.hash(password, 5)
        const user = await User.create({email, role, password: hashPassword})
        //const basket = await Basket.create({userId: user.id})
        const token = generateJwt(user.id, user.email, user.role)

        return res.json({token})
    }

    async login(req, res, next) {
        const {email, password} = req.body
        const user = await User.findOne({where : {email}})

        if(!user)
        {
            return next(ApiError.internal('User doesnt exists'))
        }

        let comparePassword = bcrypt.compareSync(password, user.password)
        if(!comparePassword)
        {
            return next(ApiError.badRequest('Wrong password'))
        }
        const token = generateJwt(user.id, user.email, user.role)
        return res.json({token})
    }

    async check(req, res, next) {
        const user = req.user
        const token = generateJwt(user.id, user.email, user.role)
        return res.json({token})
        return ""
        const {id} = req.query
        if(!id)
            return next(ApiError.badRequest('No user id'))
        res.json(id)
    }


    async uploafFile(req, res, next) {
   
        let filedata = req;
        //console.log(filedata);
        if(!filedata)
            res.send("Ошибка при загрузке файла");
        else
            res.send("Файл загружен");
    };
}


module.exports = new UserController()