const mongoose = require("mongoose")

class Database{
    constructor(libraryDatabase){
        this.libraryDatabase = libraryDatabase;
        this.bookSchema = null;
        this.Book = null;
        this.connectToLibrary();
        this.initializeBookSchema();
        this.createModel();
    }

    connectToLibrary(){
        mongoose.connect(this.libraryDatabase)
        .then(() => {
            console.log("Connected to myLibrary Database")
        })      
    }

    initializeBookSchema(){
        this.bookSchema = new mongoose.Schema(
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
    }

    createModel(){
        this.Book = mongoose.model("Book", this.bookSchema);
    }

    getLatest(){
        this.collection = {}
        this.Book.find({}).sort('-createdAt').limit(10).exec(function(err, newBooks){
            if(newBooks != null){
                this.latest = newBooks;
            }

            console.log(newBooks)
        })

        // this.Book.find({}).sort('-meta.downloads').limit(10).exec(function(err, topDownloadedBooks){
        //    this.collection.topDownloads = topDownloadedBooks;
        //    console.log(topDownloadedBooks)
        // })

        // console.log(this.collection)
        
        // this.Book.find({}, function(err, found){
        //     console.log(found)
        // })

        // console.log(this.Book)
    }
}

module.exports = Database;

