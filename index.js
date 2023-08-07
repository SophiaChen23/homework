const express = require('express');
const app = express();
app.use(express.static(__dirname));
const bodyParser = require('body-parser');
const expressSession = require('express-session')({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSession);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('App listening on port ' + port));

const passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());

const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

mongoose.connect('mongodb://localhost:27017/MyDatabase',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
const Schema = mongoose.Schema;
const UserDetail = new Schema({
    username: String,
    password: String
});
UserDetail.plugin(passportLocalMongoose);
const UserDetails = mongoose.model('userInfo', UserDetail,'userInfo');

passport.use(UserDetails.createStrategy());
passport.serializeUser(UserDetails.serializeUser());
passport.deserializeUser(UserDetails.deserializeUser());


// Fetch all users from the collection and log them
UserDetails.find({})
    .then((usersData) => {
        console.log('All Users Data:', usersData);
        console.log('length', usersData.length);
    })
    .catch((err) => {
        console.error('Error fetching users:', err);
    });


const connectEnsureLogin = require('connect-ensure-login');
// Authentication route
app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.log('Passport Authentication Error:', err); // Add this log
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

// Routes


app.get('/login', (req, res) => res.sendFile('html/login.html', { root: __dirname }));

app.get('/', connectEnsureLogin.ensureLoggedIn(), (req, res) => res.sendFile('html/index.html', { root: __dirname }));

app.get('/private', connectEnsureLogin.ensureLoggedIn(), (req, res) => res.sendFile('html/private.html', { root: __dirname }));

app.get('/user', connectEnsureLogin.ensureLoggedIn(), (req, res) => res.send({ user: req.user }));

app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Error logging out:', err);
            // Handle the error, if necessary
        }
        res.sendFile('html/logout.html', { root: __dirname });
    });
});


// UserDetails.register({username:'paul', active:false}, 'paul');
// UserDetails.register({username:'joy', active:false}, 'joy');
// UserDetails.register({username:'ray', active:false}, 'ray');


