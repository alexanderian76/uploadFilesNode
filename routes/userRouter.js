const Router = require('express')
const router = new Router()
const userController = require('../controllers/userController')
const authMiddleware = require('../middleware/authMiddleware')
const multer  = require("multer");
const {User, Directory, Files} = require('../models/models')


const storageConfig = multer.diskStorage({
    destination: (req, file, cb) =>{
        //console.log(req.query)
        //console.log(req.query.path.substr(1, req.query.path.length))
        cb(null, req.query.path.substr(1, req.query.path.length));
    },
    filename: (req, file, cb) =>{
        cb(null, decodeURI(file.originalname));
    }
});

function uploafFile(req, res, next) {
  //  console.log(req.user);
    let {filedata} = req.files;
    console.log(filedata)
    filedata.forEach(element => {
        Files.create({path: decodeURI(element.originalname), userId: req.user.id})
        Files.create({path: decodeURI(element.originalname), userId: null})
    });
   // console.log(filedata);
    if(!filedata)
        res.send("Ошибка при загрузке файла");
    else
        res.send("Файл загружен");
};


router.post('/registration', userController.registration)
router.post('/login', userController.login)
router.get('/auth', authMiddleware,userController.check)
router.post('/upload', authMiddleware,  multer({storage: storageConfig}).fields([{name: "filedata", maxCount: 10}]), uploafFile)
router.get('/get_files', authMiddleware,userController.getFiles)
router.get('/get_files_fs', authMiddleware,userController.getFilesFs)
router.get('/get_files_user', authMiddleware,userController.getUserFiles)
router.post('/add_file', authMiddleware,userController.addFileToLibraty)
router.post('/remove_file', authMiddleware,userController.removeFileFromLibraty)
router.get('/load_file', authMiddleware, userController.loadFile)
router.post('/create_dir', authMiddleware, userController.createDirectory)
router.get('/get_dirs', authMiddleware, userController.getDirs)
router.get('/get_dirs_fs', authMiddleware, userController.getDirsFs)
router.get('/load', userController.loadFileToFs)
router.post('/remove', authMiddleware, userController.removeDirectory)


module.exports = router