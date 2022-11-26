const mongoose = require("mongoose");

function initUserDB(passportLocal, findOrCreate){
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


function updateProfilePicture(User, removeImage, prevImage, image, req, res){
    User.findByIdAndUpdate(req.user._id, {profileImage: "/uploads/images/" + image}, function(err){
        if(!err){
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
    updateProfilePicture
};