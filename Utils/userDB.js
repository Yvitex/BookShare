const mongoose = require("mongoose");

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
        uploadedBooks: [String]
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

function updateProfilePicture(User, removeImage, prevImage, image, req, res){
    User.findByIdAndUpdate(req.user._id, {profileImage: "/uploads/images/" + image}, function(err){
        if(!err){
            console.log("Success Update");
            removeImage(prevImage.profileImage)
            res.redirect("/profile/user");
        }
        else{
            console.log(err);
        }
    })
}



module.exports = {
    initUserDB,
    addNewUser, 
    updateProfilePicture
};