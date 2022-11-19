const multer = require('multer')
const fs = require("fs")

class Upload{
    constructor(destination){
        this.destination = destination;
        this.initializeStorage(this.destination);
        this.initializeUpload()
    }

    initializeStorage(destination){
        this.storage = multer.diskStorage({
            destination: function(req, file, callback){
                callback(null, destination)
            },
        
            filename: function(req, file, callback){
                callback(null, Date.now() + file.originalname)
            }
        })
    }

    initializeUpload(){
        this.upload = multer({
            storage: this.storage,
            limits: {
                fileSize: 1024 * 1024 * 3
            }
        })
    }
}

function removeImage(imageName){
    fs.unlink("./Public" + imageName, function(err){
        if(err){
            console.log(err);
        }
        else{
            console.log("file removed.")
        }
    });
}

module.exports = {Upload, removeImage};


