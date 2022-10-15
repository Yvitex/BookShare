const mongoose = require("mongoose")

class Database{
    constructor(libraryDatabase){
        this.libraryDatabase = libraryDatabase;
        this.connectToLibrary();
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
        this.userSchema = new mongoose.Schema({
            username: {
                type: String,
                required: true,
                maxLength: 15,
            },
            email: String,
            password: String,
        });

        
        this.Book = mongoose.model("Book", this.bookSchema);
        this.User = mongoose.model("User", this.userSchema);
        
        this.createStrategy();
        this.checkModels();
    }

    connectToLibrary(){
        mongoose.connect(this.libraryDatabase)
        .then(() => {
            console.log("Connected to myLibrary Database")
        })      
    }

    setUserPlugin(){
        this.userSchema.plugin(passportLocalMongoose);
    }

    createStrategy(){
        passport.use(this.User.createStrategy());
        passport.serializeUser(function(user, cb) {
            process.nextTick(function() {
            cb(null, { id: user.id, username: user.username, name: user.displayName });
            });
        });

        passport.deserializeUser(function(user, cb) {
            process.nextTick(function() {
            return cb(null, user);
            });
        });
    }

    checkModels(){
        console.log(this.Book);
        console.log(this.User)
    }

    async getLatest(){
        try {
            const latestAdded = await this.Book.find({}).sort('-createdAt').limit(10);
            return latestAdded;
        }
        catch (err){
            console.log(err)
        }

    }

    async getMostDownloaded(){
        try {
            const mostDownloaded = await this.Book.find({}).sort('-meta.downloads').limit(10);
            return mostDownloaded;
        }
        catch (err){
            console.log(err)
        }
    }

    async getBookInfo(idName){
        try{
            const bookInfo = await this.Book.findById(idName);
            return bookInfo;
        }
        catch (err){
            console.log(err);
        }
    }

    async getRelatedBooks(bookTitle){
        try{
            const relatedBooks = await this.Book.find({title: bookTitle});
            return relatedBooks;
        }
        catch (err){
            console.log(err);
        }
    }

    async getInfoAndRelatedBooks(idName){
        try{
            const collection = {}
            collection.bookInfo = await this.Book.findById(idName);
            collection.relatedBooks = await this.Book.find({title: collection.bookInfo.title})
            return collection;
        }
        catch (err){
            console.log(err)
        }
    }

    async postNewBook(bookTitle, volumeNumber, authorName, downloadLink, summaryDescription, imageName){
        try{
            let sw = true;
            await this.Book.findOne({title: bookTitle.toLowerCase(), volume: volumeNumber}).then((data) => {
            if (data != null){
                console.log("already Exist");
                throw Error;
            }
            else{
                console.log("Creating Book Space")
                const newBook = new this.Book({
                    title: bookTitle.toLowerCase(),
                    author: authorName,
                    downloadLink: downloadLink,
                    volume: volumeNumber,
                    summary: summaryDescription,
                    image: imageName
                })
            
                newBook.save(function(error){
                    if(!error){
                        console.log("Saved To DB");
                    }
                    else{
                        console.log(err);
                    }
                })
            }
            }
        )
        return sw
    }
    catch (err){
        console.log(err)
    }  
    }

    async updateDownload(id){
        try{
            this.Book.findByIdAndUpdate(id, {$inc: {"meta.downloads": 1}}, {new:true}, function(err, foundBook){
                console.log("Download Updated: " + foundBook.meta.downloads);
              })
      
              const bookInfo = await this.getBookInfo(id);
              return bookInfo;
        }
        catch (error){
            console.log(error)
        }
    }

    async checkEmail(email){

    }

    async userLogin(email, password){

    }

    async userSignup(userName, email, password){
        const newUser = {
            username: userName,
            email: email,
            password: password,
        }

        this.User.register(newUser, function(err, result){
            if(err){
                console.log(err);
            }
            else{
                passport.authenticate("local")(req, res, function(){
                    console.log("Scc")
                })
            }
        })
        // const newUser = new this.User({
        //     username: userName,
        //     email: email,
        //     password: password,
        // })
        // newUser.save(function(error){
        //     if(!error){
        //         console.log("New User Saved");
        //     }
        //     else{
        //         console.log(error)
        //     }
        // })
    }
}

module.exports = Database;

