const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const bookDB = require("./Utils/bookDB");
const userDB = require("./Utils/userDB");
const {Upload, removeImage} = require("./Utils/upload");
const lmPassport = require("./Utils/localMongoosePassport");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const session = require("express-session");
const LocalStrategy = require("passport-local").Strategy;
const findOrCreate = require("mongoose-findorcreate");
const googlePassport = require("./Utils/Auth/googlePassport");
const facebookPassport = require("./Utils/Auth/facebookPassport");
const fs = require("fs");


require("dotenv").config();

app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs")

app.use(session({
    secret: "longtextofsecrets",
    resave: false,
    saveUninitialize: false,
}))
app.use(passport.initialize());
app.use(passport.session());


const Uploader = new Upload("./Public/uploads/images")
const upload = Uploader.upload

const TotalBook = bookDB.initBookDB();
const Book = TotalBook[0];
const User = userDB.initUserDB(passportLocalMongoose, findOrCreate, TotalBook[1]);

googlePassport.authGoogle(passport, User, findOrCreate);
facebookPassport.facebookAuth(passport, User, findOrCreate);

passport.use(new LocalStrategy(User.authenticate()));

lmPassport.createLocalStrategy(User, passport);

app.get("/", async function(req, res) {
    if(req.isAuthenticated()){
        const currentUser = req.user._id;
        console.log(currentUser);
        const latestAdded = await Book.find({}).sort('-createdAt').limit(10);
        const mostDownloaded = await Book.find({}).sort('-meta.downloads').limit(10);
        res.render("home", {newBooks: latestAdded, downloadedBooks: mostDownloaded, currentUser: currentUser})
    }
    else{
        res.redirect("/landing")
    }
    
})

app.get("/landing", function(req, res){
    if(req.isAuthenticated()){
        res.redirect("/")
    }
    res.render("landing")
})

app.get("/share", function(req, res) {
    const currentUser = req.user._id;
    res.render("share", {currentUser: currentUser, bookDetail: null});
})

app.get("/item/:idName", async function(req, res){
    const currentUser = req.user._id;
    const bookInfo = await Book.findById(req.params.idName);
    const relatedBooks = await Book.find({title: bookInfo.title});
    res.render("item", {itemInfo: bookInfo, books: relatedBooks, currentUser: currentUser})
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
    const books = await Book.find({_id: {$in: req.user.uploadedBooks}})
    console.log(req.user.uploadedBooks)
    console.log(books)
    res.render("profile", {currentUser: req.user, userBooks: books})
})

app.get("/edit/:bookId", function(req, res){
    bookDB.findBookDetails(req.params.bookId, Book).then((data) => {
        res.render("share", {currentUser: req.user._id, bookDetail: data});
    })
})

// app.get("/browse", async function(req, res){
//     const user = req.user._id;
//     const allBooks = await Book.find({}).sort("title").limit(25);

//     res.render("browse", {currentUser: user, bookResult: allBooks});
// })

app.get("/browse/:searchItem/:pageNumber/:limit", async function(req, res){
    const user = req.user._id;
    const pageNumber = req.params.pageNumber - 1;
    const limit = req.params.limit;
    const searchItem = req.params.searchItem;
    if(searchItem == "all"){
        const totality = await Book.find({});
        const allBooks = await Book.find({}).sort("title").skip(pageNumber * limit).limit(limit);
        res.render("browse", {currentUser: user, bookResult: allBooks, totalBooks: totality.length, active: pageNumber, regex: ""});
    }
    else{
        const totalitySearch = await Book.find({title: {$regex: searchItem, $options: "i"}});
        const searchedBooks = await Book.find({title: {$regex: searchItem, $options: "i"}}).sort("volume").skip(pageNumber * limit).limit(limit);
        res.render("browse", {currentUser: user, bookResult: searchedBooks, totalBooks: totalitySearch.length, active: pageNumber, regex: searchItem});
    }

})

app.get("/error-profile", function(req, res){
    res.render("profileError")
})

app.post("/submitBook", upload.single("bookCover"), function(req, res){
    const bookTitle = req.body.bookTitle;
    const volumeNumber = req.body.volumeNumber;
    const authorName = req.body.authorName;
    const downloadLink = req.body.downloadLink;
    const summaryDescription = req.body.summaryDescription;
    const imageName = req.file? req.file.filename: "jobless_reincarnation_cover.jpg";
    const uploader = req.user.username;

    bookDB.postBook(bookTitle, volumeNumber, authorName, downloadLink, summaryDescription, imageName, Book, res, uploader, bookDB.pushNewBook, User);

})

app.post("/download", async function(req, res){
    const id = req.body.idName;
    Book.findByIdAndUpdate(id, {$inc: {"meta.downloads": 1}}, {new:true}, function(err, foundBook){
        console.log("Download Updated: " + foundBook.meta.downloads);
      })
    const bookInfo = await Book.findById(id);
    res.redirect(bookInfo.downloadLink);
})

app.post("/login", passport.authenticate("local",{
    successRedirect: "/",
    failureRedirect: "/error-profile"
}), function(req, res){ 
});

app.post("/signup", function(req, res, next){
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    lmPassport.registerUser(username, email, password, User, res, req, passport);
})

app.post("/updateBook/:bookId", upload.single("bookCover"), async function(req, res){
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
    const image = req.file.filename;
    const user = req.user._id;
    const prevImage = await User.findById(user);
    userDB.updateProfilePicture(User, removeImage, prevImage, image, req, res)
})

app.listen(3000, () => {
    console.log("Connected to Port 3000")
})

