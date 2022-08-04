const ApiError = require('../error/ApiError');
const bcrypt = require('bcrypt')
const {User, Directory} = require('../models/models')
const jwt = require('jsonwebtoken')
const fs = require('fs');
const path = require('path');

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

    async getFiles(req, res, next) {
        let f;
       // console.log(req.query)
        let arr = await Directory.findAll()
        //console.log(arr)
            fs.readdir('.' + req.query.path, (err, files) => {
                files.filter(f => {
                    
                    let count = arr.filter(dir => {console.log(dir.path.substring(dir.path.length - f.length - 1, dir.path.length)); return dir.path.substring(dir.path.length - f.length - 1, dir.path.length) == (f + '/')}).length
                    return count < 0
                }).forEach(file => {
                console.log(file);
                f = file;
                // res.sendFile(__dirname + '/uploads/' + file);
                });
                res.send(files.filter(f => {
                   return !fs.lstatSync('.' + req.query.path + '/' + f).isDirectory()
                    let count = arr.filter(dir => {console.log(dir.path.substring(dir.path.length - f.length - 1, dir.path.length)); return dir.path.substring(dir.path.length - f.length - 1, dir.path.length) == (f + '/')}).length
                    return count == 0
                }))
            // res.sendFile(__dirname + '/uploads/' + f);
            });
    }



    async getDirs(req, res, next) {
        let f;
       // console.log(req.query)
        let arr = await Directory.findAll({attributes: ['path']})
        console.log(req.query)
        //fs.readdir('.' + req.query.dirName, (err, files) => {

/*
            res.send(
                files.filter(f => {
                    return fs.lstatSync('.' + req.query.dirName + '/' + f).isDirectory()
                     let count = arr.filter(dir => {console.log(dir.path.substring(dir.p))})
                })
            )*/
        res.send(arr.filter(d => {
            console.log(d)
            let tmp = d.path.split('/')
            tmp.pop()
            tmp.pop()
            
            tmp = tmp.join('/') + '/'
            console.log(tmp)
            return  tmp == req.query.dirName
        }).map(d => {
            let dirName = d.path.split('/')[d.path.split('/').length - 2]
            return {path: d.path, name: dirName}
        }))
   // })
        
    }

    async loadFile(req, res, next) {
        let f;
        console.log(req.query)
        
            fs.readdir('./uploads/', (err, files) => {
                console.log(files)
                files.filter(f => f == req.query.fileName).forEach(file => {
                console.log(file);
                f = file;
                // res.sendFile(__dirname + '/uploads/' + file);
                });
               // res.send(files)
               console.log(__dirname.substring(0, __dirname.length - 12) + '/uploads/' + f)
             res.sendFile(__dirname.substring(0, __dirname.length - 12) + '/uploads/' + f);
            // fs.createReadStream('./uploads/' + req.query.fileName).pipe(res);
            // console.log(res)
            /* fs.readFile('./uploads/' + req.query.fileName, (err,data) => {
                console.log(data.toString('base64'))
                res.send(data.toString('base64'));
             });*/
            });
    }


    async createDirectory(req, res, next) {

        console.log(__dirname.substring(0, __dirname.length - 12) + req.body.name + '/')
        fs.mkdir(__dirname.substring(0, __dirname.length - 12) + req.body.name + '/', (err) => {
            if (err) {
                return console.error(err);
            }
            console.log('Directory created successfully!');
        })
        try {
            await Directory.create({path: req.body.name + '/'})
        }
        catch(e) {

        }
        return;
    }
}


module.exports = new UserController()