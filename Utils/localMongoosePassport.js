
function createLocalStrategy(model, passport){
    passport.serializeUser(model.serializeUser());
    passport.deserializeUser(model.deserializeUser());
}

function registerUser(username, email, password, userModel, response, request, passport){
    const newUser = new userModel({
        username: username,
        email: email,
    })

    userModel.register(newUser, password, function(err, result){
        if(err){
            console.log(err);
            response.redirect("/landing")
        }
        else{
            passport.authenticate('local')(request, response, function(){
                response.redirect("/");
            })
        }
    })
}


module.exports = {
    createLocalStrategy,
    registerUser,
}
