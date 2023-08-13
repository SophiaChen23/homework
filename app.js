const express               =  require('express'),
      expSession            =  require("express-session"),
      app                   =  express(),
      mongoose              =  require("mongoose"),
      passport              =  require("passport"),
      bodyParser            =  require("body-parser"),
      LocalStrategy         =  require("passport-local"),
      passportLocalMongoose =  require("passport-local-mongoose"),
      User                  =  require("./models/user")
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");

//Connecting database
mongoose.connect("mongodb://localhost/auth_demo");
mongoSanitize = require('express-mongo-sanitize');
xss = require('xss-clean'),

app.use(expSession({
    secret:"mysecret",       //decode or encode session
    resave: false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        secure:true,
        maxAge: 1 * 60 * 1000// 10mins
    }
}))

passport.serializeUser(User.serializeUser());       //session encoding
passport.deserializeUser(User.deserializeUser());   //session decoding
passport.use(new LocalStrategy(User.authenticate()));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded(
      { extended:true }
))
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static("public"));


//=======================
//      O W A S P
//=======================

app.use(mongoSanitize());
const limit = rateLimit({
    max:100,
    windowMs: 60* 60 * 1000,
    MESSAGE:'Too many requests'
});
app.use('/routeName', limit);
app.use(express.json({limit:'10kb'}));
app.use(xss());
app.use(helmet());

//=======================
//      R O U T E S
//=======================
app.get("/", (req,res) =>{
    res.render("home");
})
app.get("/userprofile" ,(req,res) =>{
    res.render("userprofile");
})
//Auth Routes
app.get("/login",(req,res)=>{
    res.render("login");
});
app.post("/login",passport.authenticate("local",{
    successRedirect:"/userprofile",
    failureRedirect:"/login"
}),function (req, res){
});
app.get("/register",(req,res)=>{
    res.render("register");
});

app.post("/register",(req,res)=>{

    User.register(new User({username: req.body.username,email: req.body.email,phone: req.body.phone}),req.body.password,function(err,user){
        if(err){
            console.log(err);
            res.render("register");
        }
        passport.authenticate("local")(req,res,function(){
            res.redirect("/login");
        })
    })
})
app.get("/logout",(req,res)=>{
    req.logout(function(err) {
        if (err) {
            // Handle error if logout fails
            console.error('Error during logout:', err);
            return;
        }
    res.redirect("/");
});
});
function isLoggedIn(req,res,next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

//Listen On Server
app.listen(process.env.PORT || 3000,function (err) {
    if(err){
        console.log(err);
    }else {
        console.log("Server Started At Port 3000");
    }
});
