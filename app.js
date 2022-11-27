const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const bookDB = require("./Utils/bookDB");
const userDB = require("./Utils/userDB");
const commentDB = require("./Utils/commentDB");
const {Upload, removeImage} = require("./Utils/upload");
const lmPassport = require("./Utils/localMongoosePassport");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const session = require("express-session");
const LocalStrategy = require("passport-local").Strategy;
const findOrCreate = require("mongoose-findorcreate");
const googlePassport = require("./Utils/Auth/googlePassport");
const facebookPassport = require("./Utils/Auth/facebookPassport");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");


require("dotenv").config();

app.use(express.static(path.join(__dirname, "Public")));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs")

app.use(session({
    secret: "longtextofsecrets",
    resave: false,
    saveUninitialize: false,
}))
app.use(passport.initialize());
app.use(passport.session());

app.set('views', path.join(__dirname, "views"));

console.log(path.join(__dirname, "views"));
console.log(path.join(__dirname, "Public"));


const Uploader = new Upload("./Public/uploads/images");
const upload = Uploader.upload;
const DATABASE = process.env.ATLAS;

console.log(DATABASE + "/myLibrary")

mongoose.connect(DATABASE + "/myLibrary")
.then(() => {
    console.log("Connected to myLibrary Database in " + DATABASE);
})

const TotalBook = bookDB.initBookDB();
const Book = TotalBook[0];
const User = userDB.initUserDB(passportLocalMongoose, findOrCreate);
const Comment = commentDB.initMessageDb();

googlePassport.authGoogle(passport, User, findOrCreate);
facebookPassport.facebookAuth(passport, User, findOrCreate);

passport.use(new LocalStrategy(User.authenticate()));

lmPassport.createLocalStrategy(User, passport);

app.get("/", async function(req, res) {
    try {
        if(req.isAuthenticated()){
            const currentUser = req.user._id;
            const latestAdded = await Book.find({}).sort('-createdAt').limit(10);
            const mostDownloaded = await Book.find({}).sort('-meta.downloads').limit(10);
            res.render("home.ejs", {newBooks: latestAdded, downloadedBooks: mostDownloaded, currentUser: currentUser})
        }
        else{
            res.redirect("/landing")
        }
    } catch (error) {
        console.log(error);
        res.redirect("/error-profile");
    }

    
})

app.get("/landing", function(req, res){
    if(req.isAuthenticated()){
        res.redirect("/")
    }
    res.render("landing.ejs")
})

app.get("/share", function(req, res) {
    const currentUser = req.user._id;
    res.render("share.ejs", {currentUser: currentUser, bookDetail: null});
})

app.get("/item/:idName", async function(req, res){
    const currentUser = req.user._id;
    const commentorArray = [];
    const commentorResult = [];
    try {
        const bookInfo = await Book.findById(req.params.idName);
        const uploader = await User.findOne({username: bookInfo.uploader})
        const relatedBooks = await Book.find({title: bookInfo.title});
        const comments = await Comment.find({_id: bookInfo.reviews});
        
        comments.forEach((data) => {
            commentorArray.push(data.user);
        })

        if(commentorArray) {
            for(let i = 0; i < commentorArray.length && i < 30; i++) {
                let data = await User.find({_id: commentorArray[i]});
                commentorResult.push(data);
            }
        }

        res.render("item.ejs", {
            itemInfo: bookInfo, 
            books: relatedBooks, 
            currentUser: currentUser, 
            user: req.user, 
            uploader: uploader._id,
            commentors: commentorResult,
            comments: comments
        
        })
        

        
    }
    catch (error) {
        console.log(error);
        res.redirect("/error-profile");
    }

    
})

app.get("/logout", function(req, res){
    req.logout(function(err){
        if(err){
            console.log(err);
        }
    })
    res.redirect("/");
})

app.get("/auth/google", passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.profile',
'https://www.googleapis.com/auth/userinfo.email'
]}));

app.get("/auth/google/home",
  passport.authenticate('google', { failureRedirect: '/landing' }),
  function(req, res) {
   res.redirect('/');
});

app.get("/auth/facebook", passport.authenticate('facebook', {scope: ["email"]}));

app.get('/auth/facebook/home',
  passport.authenticate('facebook', { failureRedirect: '/landing' }),
  function(req, res) {
    res.redirect('/');
  });

app.get("/profile/:profileId", async function(req, res){
    try {
        const books = await Book.find({_id: {$in: req.user.uploadedBooks}})
        res.render("profile.ejs", {currentUser: req.user, userBooks: books})
    } catch (error) {
        console.log(error);
        res.redirect("/error-profile.ejs");
    }

})

app.get("/edit/:bookId", function(req, res){
    bookDB.findBookDetails(req.params.bookId, Book).then((data) => {
        res.render("share.ejs", {currentUser: req.user._id, bookDetail: data});
    })
})

app.get("/visit/:userId", async function(req, res) {
    const currentUser = req.user._id;
    try {
        const user = await User.findById(req.params.userId);
        const userBooks = await Book.find({_id: {$in: user.uploadedBooks}})
        res.render("visitor.ejs", {user: user, userBooks: userBooks, currentUser: currentUser})
    } catch (error) {
        console.log(error);
        res.redirect("/error-profile");;
    }

})

app.get("/browse/:searchItem/:pageNumber/:limit", async function(req, res){
    const user = req.user._id;
    const pageNumber = req.params.pageNumber - 1;
    const limit = req.params.limit;
    const searchItem = req.params.searchItem;
    if(searchItem == "all"){
        try {
            const totality = await Book.find({});
            const allBooks = await Book.find({}).sort("title").skip(pageNumber * limit).limit(limit);
            res.render("browse.ejs", {currentUser: user, bookResult: allBooks, totalBooks: totality.length, active: pageNumber, regex: ""});
        } catch (error) {
            console.log(error);
            res.redirect("/error-profile");
        }

    }
    else{
        try {
            const totalitySearch = await Book.find({title: {$regex: searchItem, $options: "i"}});
            const searchedBooks = await Book.find({title: {$regex: searchItem, $options: "i"}}).sort("volume").skip(pageNumber * limit).limit(limit);
            res.render("browse.ejs", {currentUser: user, bookResult: searchedBooks, totalBooks: totalitySearch.length, active: pageNumber, regex: searchItem});
        } catch (error) {
            console.log(error);
            res.redirect("/error-profile");
        }
       
    }

})

app.get("/error-profile", function(req, res){
    res.render("profileError.ejs")
})

app.post("/submitBook", upload.single("bookCover"), function(req, res){
    const bookTitle = req.body.bookTitle;
    const volumeNumber = req.body.volumeNumber;
    const authorName = req.body.authorName;
    const downloadLink = req.body.downloadLink;
    const summaryDescription = req.body.summaryDescription;
    const imageName = req.file? req.file.filename: "jobless_reincarnation_cover.jpg";
    const uploader = req.user;

    bookDB.postBook(bookTitle, volumeNumber, authorName, downloadLink, summaryDescription, imageName, Book, res, uploader, bookDB.pushNewBook, User);

})

app.post("/download", async function(req, res){
    const id = req.body.idName;
    Book.findByIdAndUpdate(id, {$inc: {"meta.downloads": 1}}, {new:true}, function(err, foundBook){
        console.log("Download Updated: " + foundBook.meta.downloads);
      })
    try {
        const bookInfo = await Book.findById(id);
        res.redirect(bookInfo.downloadLink);
    } catch (error) {
        console.log(error);
    }

})

app.post("/login", passport.authenticate("local",{
    successRedirect: "/",
    failureRedirect: "/error-profile"
}), function(req, res){ 
});

app.post("/comment", function(req, res){
    try {
        const user = req.user._id;
        const comment = req.body.commentData;
        const currentBook = req.body.currentBook;

        const newComment = new Comment({
            user: user,
            message: comment, 
            time: Date.now()
        })

        newComment.save(async function(error, comment) {
            if(!error) {
                await Book.findByIdAndUpdate(currentBook, {$push: {reviews: [comment._id]}});
                res.redirect("/item/" + currentBook);
            }
            else {
                console.log(error);
            }
        })    
    } catch (error) {
        console.log(error);
    }
  

})

app.post("/signup", function(req, res, next){
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    lmPassport.registerUser(username, email, password, User, res, req, passport);
})

app.post("/updateBook/:bookId", upload.single("bookCover"), async function(req, res){
    try {
        const bookId = req.params.bookId;
        const title = req.body.bookTitle;
        const author = req.body.authorName;
        const downloadLink = req.body.downloadLink;
        const volume = req.body.volumeNumber;
        const summary = req.body.summaryDescription;
        let image = undefined;
        if(req.file){
            recentImage = await bookDB.imageFetch(bookId, Book);
            recentImage = recentImage.image;
            fs.unlink("./Public/uploads/images/"+recentImage, function(err){
                if(err){
                    console.log(err)
                }
                else{
                    console.log("Sucess Deletion: " + recentImage)
                }
            });
            image = req.file.filename;
        }
    
        bookDB.updateBook(bookId, title, author, downloadLink, volume, summary, image, Book, res)
    } catch (error) {
        console.log(error)
        res.redirect("/error-profile");
    }

})

app.delete("/delete/:bookId", function(req, res){
    const user = req.user._id;
    bookDB.deleteBook(req.params.bookId, Book, res);
    User.updateOne({_id: user}, {$pullAll: {uploadedBooks: [req.params.bookId]}}, function(err) {
        if(err){
            console.log(err);
        }
        else{
            console.log("deleted " + req.params.bookId)
            
        }
    })
})

app.post("/change-profile-container", upload.single("profilePicture"), async function(req, res){
    try {
        const image = req.file.filename;
        const user = req.user._id;
        const prevImage = await User.findById(user);
        userDB.updateProfilePicture(User, removeImage, prevImage, image, req, res)
    } catch (error) {
        console.log(error);
    }

})

const PORT = process.env.PORT || 3000

app.listen( PORT, () => {
    console.log("Connected to " + PORT);
})

