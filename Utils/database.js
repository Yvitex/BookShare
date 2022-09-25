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

    async getLatest(){
        try {
            this.latestAdded = await this.Book.find({}).sort('-createdAt').limit(10);
            return this.latestAdded;
        }
        catch (err){
            console.log(err)
        }

    }

    async getMostDownloaded(){
        try {
            this.mostDownloaded = await this.Book.find({}).sort('-meta.downloads').limit(10);
            return this.mostDownloaded;
        }
        catch (err){
            console.log(err)
        }
    }

    async getBookInfo(idName){
        try{
            this.bookInfo = await this.Book.findById(idName);
            return this.bookInfo;
        }
        catch (err){
            console.log(err);
        }
    }

    async getRelatedBooks(bookTitle){
        try{
            this.relatedBooks = await this.Book.find({title: bookTitle});
            return this.relatedBooks;
        }
        catch (err){
            console.log(err);
        }
    }

    async getInfoAndRelatedBooks(idName){
        try{
            this.collection = {}
            this.collection.bookInfo = await this.Book.findById(idName);
            this.collection.relatedBooks = await this.Book.find({title: this.collection.bookInfo.title})
            return this.collection;
        }
        catch (err){
            console.log(err)
        }
    }

    // postNewBook(bookTitle, volumeNumber, authorName, downloadLink, summaryDescription, imageName){
    //     this.Book.findOne({title: req.body.bookTitle.toLowerCase(), volume: req.body.volumeNumber}, function(err, foundBook){
    //         if(foundBook){
    //             console.log("already Exist")
    //             console.log(foundBook)
    //         }
    //         else{
    //             console.log("Creating Book Space")
    //             const newBook = new Book({
    //                 title: req.body.bookTitle.toLowerCase(),
    //                 author: req.body.authorName,
    //                 downloadLink: req.body.downloadLink,
    //                 volume: req.body.volumeNumber,
    //                 summary: req.body.summaryDescription,
    //                 image: req.file.filename
    //             })
            
    //             newBook.save(function(error){
    //                 if(!error){
    //                     console.log("Saved To DB")
    //                     res.redirect('/')
    //                 }
    //                 else{
    //                     console.log(err)
    //                 }
    //             })
    //         }
    //     })
    // }

}

module.exports = Database;

