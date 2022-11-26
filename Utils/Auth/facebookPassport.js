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
          }, 
          async function (err, user) {
            try {
              const image = await User.findOne({facebookId: profile.id});
            
              if(!image.profileImage){
                console.log("true")
                User.updateOne({facebookId: profile.id}, {profileImage: "https://graph.facebook.com/" + profile.id + "/picture?width=200&height=200&access_token=" + accessToken}, function(err){
                  if(err){
                    console.log(err)
                  }
                })
              }
            return cb(err, user);
            } catch (error) {
              console.log(error)
            }
            
        });
      }
    ));
}

module.exports = {
  facebookAuth,
}