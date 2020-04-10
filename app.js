const express = require('express');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const mongoose = require('mongoose');
const app = express();

//bodyparser
app.use(express.urlencoded({ extended: false }));
//express session
app.use(
  session({
    secret: 'I am learning Auth',
    resave: false,
    saveUninitialized: false,
  })
);
//passport configure
app.use(passport.initialize());
app.use(passport.session());

//configurations
app.set('view engine', 'ejs');

//connect to mongodb
mongoose.connect('mongodb://localhost:27017/authmore', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.set('useCreateIndex', true);

//create User model
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

//passport local mongoose
userSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User', userSchema);

//passport local config
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//routes
app.get('/', (req, res) => {
  res.render('home');
});
app.get('/secret', (req, res) => {
  res.render('secrets');
});
//registering user
app.post('/register', function (req, res) {
  User.register(
    new User({ username: req.body.username }),
    req.body.password,
    function (err, account) {
      if (err) {
        return res.render('home');
      }

      passport.authenticate('local')(req, res, function () {
        res.redirect('/secret');
      });
    }
  );
});
//logging in user
app.get('/login', (req, res) => {
  res.render('login');
});

app.post(
  '/login',
  async (req, res) =>
    await passport.authenticate('local', {
      successRedirect: '/secret',
      failureRedirect: '/login',
    })(req, res)
);

//logout
app.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

//server setup
app.listen(3000, () => console.log('server has started!!!'));
