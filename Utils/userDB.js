const mongoose = require("mongoose");
const passport = require("passport");

function initUserDB(passportLocal, findOrCreate, Book){
    const userSchema = new mongoose.Schema({
        username: {
            type: String,
            required: true,
            maxLength: 80,
        },
        email: String,
        password: String,
        googleId: String,
        facebookId: String,
        profileImage: String,
        uploadedBooks: [Book]
    });

    userSchema.plugin(passportLocal);
    userSchema.plugin(findOrCreate)

    const User = mongoose.model("User", userSchema);
    return User;
}

function addNewUser(username, email, password, userSchema, response){
    const newUser = new userSchema({
        username: username,
        email: email,
        password: password,
    })

    newUser.save(function(err){
        if(!err){
            console.log("Added new User");
            response.redirect("/");
        }
        else{
            console.log(err)
        }
    })
}

function pushNewBook(User, username, Book){
    User.updateOne({username: username}, {$push: {uploadedBooks: [Book]}} ,function(err, resultUser){
        if(err){
            console.log("ERRRR")
            console.log(err)
        }
        else{
            console.log("No err")
        }
    })
}

module.exports = {
    initUserDB,
    addNewUser, 
    pushNewBook,
};