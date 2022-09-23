const express = require("express")
const mongoose = require("mongoose")
const bodyParser = require('body-parser')
const multer = require('multer')
const app = express()
const Database = require("./Utils/database")

mongoose.connect("mongodb://0.0.0.0:27017/myLibrary")
    .then(() => {
        console.log("Connected to myLibrary Database")
})

// const database = new Database("mongodb://0.0.0.0:27017/myLibrary")


app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs")

const bookSchema = new mongoose.Schema(
    {
        title: String,
        author: String,
        downloadLink: String,
        volume: Number,
        summary: String,
        reviews: [String],
        image: {type: String, default: "jobless_reincarnation_cover.jpg"},  
        meta: {
            rating: {
                type: Number,
                min: 0,
                max: 5,
                default: 0
            },
            downloads: {type: Number, default: 0},
            bookmark: {type: Number, default: 0},
        },
 
    },
    {timestamps: true}
)

const Book = mongoose.model("Book", bookSchema)

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

    Book.find({}).sort('-createdAt').limit(10).exec(function(err, newBooks){
        Book.find({}).sort('-meta.downloads').limit(10).exec(function(err, topDownloadedBooks){
            res.render("home", {newBooks: newBooks, downloadedBooks: topDownloadedBooks})
        })
    })

    // const lastAndTops = database.getLatest()
    // res.render("home", {newBooks: lastAndTops.latest, downloadedBooks: lastAndTops.topDownloads})

})

app.get("/share", function(req, res) {
    res.render("share");
})

app.get("/item/:idName", function(req, res){

    Book.findById(req.params.idName, function(err, bookResult){
        if(!err){
            Book.find({title: bookResult.title}, function(err, relatedBooks) {
                res.render("item", {itemInfo: bookResult, books: relatedBooks})
            })
        }
        else{
            console.log(err)
        }
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



// Create array object that will output as cards (Name and Volume Number)
// Create a local database for it
// Try to upload some image to the database
// New entries will count the number of books uploaded, then output the last 10 items in the list
// Top donwloads will store the number of downloads in the database, the first 10 highest items will be outputed
// as for genre, i'll think about it
// Structure :
// {
//     title: String,
//     volume: Number,
//     summary: String,
//     meta: {
//         bookmarked: Number,
//         downloads: Number,
//     }
// }