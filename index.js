const express = require('express');
const app = express();

app.use(express.static(__dirname));

const bodyParser = require('body-parser');
const expressSession = require('express-session')({
    secret:'secret',
    resave:false,
    saveUninitialized:false
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));
app.use(expressSession);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('App listening on port ' + port));


// passport setup
const passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());

// mongoose
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');


// mongoose.connect('mongodb://localhost/MyDatabase',
//     {
//         useNewUrlParser:true,
//         useUnifiedTopology: true
//     }, (err) => {
//         if (err) {
//             console.error('Error connecting to MongoDB:', err);
//         } else {
//             console.log('Successfully connected to MongoDB');
//         }
//         });


const Schema = mongoose.Schema;
const UserDetail = new Schema({
    username:String,
    password:String
});

UserDetail.plugin(passportLocalMongoose);
const UserDetails = mongoose.model('userInfo', UserDetail);

UserDetails.find({})

    .then((usersData) => {
        console.log('All Users Data:', usersData);
    })
    .catch((err) => {
        console.error('Error fetching users:', err);
    });

// passport local authentication
passport.use(UserDetails.createStrategy());

passport.serializeUser(UserDetails.serializeUser());
passport.deserializeUser(UserDetails.deserializeUser());


// routes

const connectEnsureLogin = require('connect-ensure-login');

UserDetails.findOne({ username: 'paul' })
    .then((user) => {
        if (user) {
            console.log('User Found:', user);
        } else {
            console.log('User Not Found.');
        }
    })
    .catch((err) => {
        console.error('Error fetching user:', err);
    });

async function connectToMongo() {
    try {
        await mongoose.connect('mongodb://localhost/MyDatabase', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Successfully connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}
connectToMongo();



app.post('/login', (req, res, next) =>{
    // const receivedUsername = req.body.username;
    // const receivedPassword = req.body.password;
    // console.log('Received Username:', receivedUsername);
    // console.log('Received Password:', receivedPassword);
    // console.log(UserDetails.length);
    // console.log(UserDetails);
    // UserDetails.find({}).then ((allUsers) => {
    //
    //     console.log(allUsers.length);
    //     // Log all usernames and passwords from the database
    //     allUsers
    //         .find({})
    //         .limit(10) // Limit the results to 10 documents (you can change the number as needed)
    //         .then((usersData) => {
    //             console.log('All Users Data:', usersData);
    //         })
    //         .catch((err) => {
    //             console.error('Error fetching users:', err);
    //         });
    //
    // });

    passport.authenticate(

        'local',


        (err, user,info) => {

            if (err) {
                return next(err);
            }
            if (!user) {
                return res.redirect('/login?info=' + info);
            }
            req.logIn(user, function (err) {
                if (err) {
                    return next(err);
                }
                return res.redirect('/');
            });



        })(req, res, next);
});


app.get('/login', (req, res) => res.sendFile('html/login.html',
    {root:__dirname})
);

app.get('/',
    connectEnsureLogin.ensureLoggedIn(),
    (req, res) => res.sendFile('html/login.html',
    {root:__dirname})
);

app.get('/private',
    connectEnsureLogin.ensureLoggedIn(),
    (req, res) => res.sendFile('html/private.html',
        {root:__dirname})
);

app.get('/user',
    connectEnsureLogin.ensureLoggedIn(),
    (req, res) => res.send({userLreq,user})
);

app.get('/logout',
    (req, res) => {
        req.logout(),
        res.sendFile('html/logout.html',
            {root:__dirname}
            )
    });
