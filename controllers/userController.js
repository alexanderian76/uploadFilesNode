const ApiError = require('../error/ApiError');
const bcrypt = require('bcrypt')
const {User, Directory, Files} = require('../models/models')
const jwt = require('jsonwebtoken')
const fs = require('fs');
const path = require('path');
const { json } = require('body-parser');
const { response } = require('express');

const generateJwt = (id, email, role) => {
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

        //---------------------------Creation dir after registration--------------------------------------- 

        fs.mkdir(__dirname.substring(0, __dirname.length - 11) + user.email + '/', (err) => {
            if (err) {
                return console.error(err);
            }
            console.log('Directory created successfully! Registration method!');
            
        })

        //------------------------------------------------------------------
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
        res.json({token})
        console.log('check after')
    }


    async uploafFile(req, res, next) {
        let filedata = req;
        console.log(req)
        if(!filedata)
            res.send("Ошибка при загрузке файла");
        else {
           // let user = await User.findOne({where: {email : req.query.user}})
          // await Files.create({userId: user.id, path: req.query.fileName})
            res.send("Файл загружен");
        }
    };


    async getUserFiles(req, res, next) {
        //if(req.user.email != req.query.path.split('/')[1])
          //  return next(ApiError.badRequest('Incorrect user'))
       // console.log(req.query)
        try{
            
            Files.findAll({attributes: ['path'], where: {userId: req.user.id}}).then(response => {
                let tmpArr = []
                response.forEach(item => {
                    if(item.path.toLowerCase().includes(req.query.search.toLowerCase()) || req.query.search === undefined || req.query.search === "")
                        tmpArr.push(item.path)
                })
                res.send(tmpArr)
            })
            
            
                
               
        }
        catch(e) {
            
        }
    }

    async getFiles(req, res, next) {
        //if(req.user.email != req.query.path.split('/')[1])
          //  return next(ApiError.badRequest('Incorrect user'))
        console.log(req.query)
        try{
           /* fs.readdir('.' + req.query.path, (err, files) => {
                try {
                    res.send(files.filter(f => {
                    return !fs.lstatSync('.' + req.query.path + '/' + f).isDirectory() && (req.query.search === undefined ||  f.toLowerCase().includes(req.query.search.toLowerCase()) || req.query.search === "")
                    }).slice(0,req.query.count))
                }
                catch(e) {

                }
            });*/
            Files.findAll({attributes: ['path'], where: {userId: null}, limit: req.query.count}).then(response => {
                let tmpArr = []
                response.forEach(item => {
                    if(item.path.toLowerCase().includes(req.query.search.toLowerCase()) || req.query.search === undefined || req.query.search === "")
                        tmpArr.push(item.path)
                })
                res.send(tmpArr)
            })
        }
        catch(e) {
            
        }
    }



    async getDirs(req, res, next) {
        let f;
        console.log(req.user.email)
        console.log(req.query.dirName.split('/')[1])
       // if(req.user.email != req.query.dirName.split('/')[1])
        //    return next(ApiError.badRequest('Incorrect user'))
        fs.readdir('.' + req.query.dirName, (err, files) => {
            try {
                res.send(files.filter(f => {
                return fs.lstatSync('.' + req.query.dirName + '/' + f).isDirectory()
                }))
            }
            catch(e) {

            }
        });
        /*let arr = await Directory.findAll({attributes: ['path']})
        res.send(arr.filter(d => {
            console.log(d)
            let tmp = d.path.split('/')
            tmp.pop()
            tmp.pop()
            
            tmp = tmp.join('/') + '/'
            return  tmp == req.query.dirName
        }).map(d => {
            let dirName = d.path.split('/')[d.path.split('/').length - 2]
            return {path: d.path, name: dirName}
        }))*/
    }

    async addFileToLibraty(req, res, next) {
        Files.create({userId: req.user.id, path: decodeURI(req.query.path)})
        res.send('OK')
    }

    async removeFileFromLibraty(req, res, next) {
        Files.destroy({where: {userId: req.user.id, path: decodeURI(req.query.path)}})
        res.send('OK')
    }

    async loadFile(req, res, next) {
        res.send(jwt.sign(__dirname.substring(0, __dirname.length - 12) + req.query.fileName, process.env.SECRET_KEY))
    }

    async loadFileToFs(req, res, next) {
        res.sendFile(jwt.decode(req.query.token));
    }

    async createDirectory(req, res, next) {

        console.log(__dirname.substring(0, __dirname.length - 12) + req.body.name + '/')
        fs.mkdir(__dirname.substring(0, __dirname.length - 12) + req.body.name + '/', (err) => {
            if (err) {
                return console.error(err);
            }
            console.log('Directory created successfully!');
            res.send('OK')
        })
       /* try {
            await Directory.create({path: req.body.name + '/'})
            res.send('OK')
        }
        catch(e) {

        }*/
        return;
    }

    async removeDirectory(req, res, next) {
        console.log( req.body.dirName)
       // console.log(__dirname.substring(0, __dirname.length - 12) + req.body.dirName + '/')
        fs.rm(__dirname.substring(0, __dirname.length - 12) + req.body.dirName, { recursive: true, force: true },
        (err) => {
            if (err) {
                return console.error(err);
            }
            console.log('Directory deleted successfully!');
            res.send('OK')
        })
        /*try {
            let dirs = await Directory.findAll()
            let filteredDirs = dirs.filter(dir => dir.path.includes(req.body.dirName))
            for(let i = 0; i < filteredDirs.length; i++) {
                await Directory.destroy({where: {path: filteredDirs[i].path}})
            }
            res.send('OK')
        }
        catch(e) {
            console.log(e)
        }*/
        return;
    }

}


module.exports = new UserController()