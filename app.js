const express = require("express");
require('dotenv').config()
const multer  = require("multer");
const cors  = require("cors");
const router = require('./routes/index')
const sequelize = require('./db')
var bodyParser = require('body-parser')
const errorHandler = require('./middleware/ErrorHandlingMiddleware')

const testFolder = './uploads/';
const fs = require('fs');
const ApiError = require("./error/ApiError");


  
const app = express();
app.use(cors())
app.use(express.json())
app.use(bodyParser.json());
const storageConfig = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, "uploads");
    },
    filename: (req, file, cb) =>{
        cb(null, file.originalname);
    }
});
  
app.use(express.static(__dirname));
app.use('/api', router);
//app.use('/api/upload', multer({storage: storageConfig}).fields([{name: "filedata", maxCount: 10}]));
/*app.post("/upload", function (req, res, next) {
   
    let filedata = req;
    console.log(filedata);
    if(!filedata)
        res.send("Ошибка при загрузке файла");
    else
        res.send("Файл загружен");
});*/
app.get("/get", function (req, res, next) {
   let f;
   console.log(req.query)
   
    fs.readdir(testFolder, (err, files) => {
        files.forEach(file => {
          console.log(file);
          f = file;
         // res.sendFile(__dirname + '/uploads/' + file);
        });
        res.send(files.join())
       // res.sendFile(__dirname + '/uploads/' + f);
      });
      
    
});

app.use(errorHandler)

const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()
        app.listen(5000, () => console.log(`Server started on port 5000`))
    } catch (e) {
        console.log(e)
    }
}
//app.listen(5000);
start()