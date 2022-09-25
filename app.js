const express = require("express")
const mongoose = require("mongoose")
const bodyParser = require('body-parser')
const multer = require('multer')
const app = express()
const Database = require("./Utils/database")

const database = new Database("mongodb://0.0.0.0:27017/myLibrary")

app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs")


const storage = multer.diskStorage({
    destination: function(req, file, callback){
        callback(null, './Public/uploads/images')
    },

    filename: function(req, file, callback){
        callback(null, Date.now() + file.originalname)
    }
})


const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 3
    }
})


app.get("/", function(req, res) {

    Promise.allSettled([database.getLatest(), database.getMostDownloaded()]).then((lastAndTops) => {
        res.render("home", {newBooks: lastAndTops[0].value, downloadedBooks: lastAndTops[1].value})
    })
    
    
})

app.get("/share", function(req, res) {
    res.render("share");
})

app.get("/item/:idName", function(req, res){

    const data = database.getInfoAndRelatedBooks(req.params.idName);
        data.then((result) => {
            res.render("item", {itemInfo: result.bookInfo, books: result.relatedBooks})
        })
})

app.post("/submitBook", upload.single("bookCover"), function(req, res){

    Book.findOne({title: req.body.bookTitle.toLowerCase(), volume: req.body.volumeNumber}, function(err, foundBook){
        if(foundBook){
            console.log("already Exist")
            console.log(foundBook)
        }
        else{
            console.log("Creating Book Space")
            const newBook = new Book({
                title: req.body.bookTitle.toLowerCase(),
                author: req.body.authorName,
                downloadLink: req.body.downloadLink,
                volume: req.body.volumeNumber,
                summary: req.body.summaryDescription,
                image: req.file.filename
            })
        
            newBook.save(function(error){
                if(!error){
                    console.log("Saved To DB")
                    res.redirect('/')
                }
                else{
                    console.log(err)
                }
            })
        }
    })
})

// mongoose.set('useFindAndModify', false);

app.post("/download", function(req, res){
    Book.findByIdAndUpdate(req.body.idName, {$inc: {"meta.downloads": 1}}, {new:true}, function(err, foundBook){
        console.log("Downloads Updated: " + foundBook.meta.downloads)
        // windows.open(foundBook.downloadLink)
        res.redirect(foundBook.downloadLink)
    })
})





app.listen(3000, () => {
    console.log("Connected to Port 3000")
})

