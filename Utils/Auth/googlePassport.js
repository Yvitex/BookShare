const passport = require("passport");
const { initUserDB } = require("../userDB");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

function authGoogle(passport, User, findOrCreate){
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT,
        clientSecret: process.env.GOOGLE_SECRET,
        callbackURL: "http://localhost:3000/auth/google/home",
    }, 
    function(accessToken, refreshToken, profile, cb){
        User.findOrCreate(
                {
                    googleId: profile.id, 
                    username: profile.displayName, 
                    profileImage: profile._json.picture,
                    email: profile.emails[0].value,
                }, 
                function(err, user){
                    console.log("****")
                    console.log(user);
                    console.log("****")
                    return cb(err, user);
        });
    }
    ));
}

module.exports = {
    authGoogle
}



