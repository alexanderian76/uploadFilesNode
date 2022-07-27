const Router = require('express')
const router = new Router()
const userController = require('../controllers/userController')
const authMiddleware = require('../middleware/authMiddleware')
const multer  = require("multer");

const storageConfig = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, "uploads");
    },
    filename: (req, file, cb) =>{
        cb(null, file.originalname);
    }
});

function uploafFile(req, res, next) {
    console.log(req.user);
    let {filedata} = req.files;
    console.log(filedata);
    if(!filedata)
        res.send("Ошибка при загрузке файла");
    else
        res.send("Файл загружен");
};


router.post('/registration', userController.registration)
router.post('/login', userController.login)
router.get('/auth', authMiddleware,userController.check)
router.post('/upload', authMiddleware,  multer({storage: storageConfig}).fields([{name: "filedata", maxCount: 10}]), uploafFile)


module.exports = router