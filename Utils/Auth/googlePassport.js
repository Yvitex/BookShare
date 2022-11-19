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
        // console.log("Profile url: " + profile._json.image.url.replace("?sz=50", ""));
        console.log("Direct Profile: " + profile._json["picture"]);
        console.log("Object: " + profile)
        User.findOrCreate(
                {
                    googleId: profile.id, 
                    username: profile.displayName, 
                    email: profile.emails[0].value,
                }, 
                async function(err, user){
                    const image = await User.findOne({googleId: profile.id});
                    if(!image.profileImage){
                        User.updateOne({googleId: profile.id}, {profileImage: profile._json["picture"]}, function(err){
                            if(err){
                            console.log(err)
                        }
                    })
                    }
                    return cb(err, user);
        });
    }
    ));
}

module.exports = {
    authGoogle
}



