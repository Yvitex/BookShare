const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const bookDB = require("./Utils/bookDB");
const userDB = require("./Utils/userDB");
const Upload = require("./Utils/upload");
const lmPassport = require("./Utils/localMongoosePassport");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const session = require("express-session");
const LocalStrategy = require("passport-local").Strategy;
const findOrCreate = require("mongoose-findorcreate");
const googlePassport = require("./Utils/Auth/googlePassport");
const facebookPassport = require("./Utils/Auth/facebookPassport");

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
        const latestAdded = await Book.find({}).sort('-createdAt').limit(10);
        const mostDownloaded = await Book.find({}).sort('-meta.downloads').limit(10);
        res.render("home", {newBooks: latestAdded, downloadedBooks: mostDownloaded})
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
    res.render("share");
})

app.get("/item/:idName", async function(req, res){
    const bookInfo = await Book.findById(req.params.idName);
    const relatedBooks = await Book.find({title: bookInfo.title});
    res.render("item", {itemInfo: bookInfo, books: relatedBooks})
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
    // Successful authentication, redirect home.
   res.redirect('/');
});

app.get("/auth/facebook", passport.authenticate('facebook', {scope: ["email"]}));

app.get('/auth/facebook/home',
  passport.authenticate('facebook', { failureRedirect: '/landing' }),
  function(req, res) {
    res.redirect('/');
  });

app.post("/submitBook", upload.single("bookCover"), function(req, res){

    const bookTitle = req.body.bookTitle;
    const volumeNumber = req.body.volumeNumber;
    const authorName = req.body.authorName;
    const downloadLink = req.body.downloadLink;
    const summaryDescription = req.body.summaryDescription;
    const imageName = req.file.filename;
    const uploader = req.user.username;

    bookDB.postBook(bookTitle, volumeNumber, authorName, downloadLink, summaryDescription, imageName, Book, res, uploader, userDB.pushNewBook, User);

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
    failureRedirect: "/landing"
}), function(req, res){ 
});

app.post("/signup", function(req, res, next){
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    lmPassport.registerUser(username, email, password, User, res, req, passport);
})


app.listen(3000, () => {
    console.log("Connected to Port 3000")
})

