const FacebookStrategy = require("passport-facebook").Strategy;

function facebookAuth(passport, User, findOrCreate){
    passport.use(new FacebookStrategy({
        clientID: process.env.FB_ID,
        clientSecret: process.env.FB_SECRET,
        callbackURL: "http://localhost:3000/auth/facebook/home",
        profileFields: ['id', 'displayName', 'name', 'photos', 'emails']
      },
      function(accessToken, refreshToken, profile, cb) {
        User.findOrCreate(
          {
            facebookId: profile.id,
            username: profile.displayName, 
            email: profile.emails[0].value,
            profileImage: "https://graph.facebook.com/" + profile.id + "/picture?width=200&height=200&access_token=" + process.env.FB_ACCESS_TOKEN
          }, 
          function (err, user) {
            console.log("****")
            console.log(user)
            console.log("****")
            return cb(err, user);
        });
      }
    ));
}

module.exports = {
  facebookAuth,
}