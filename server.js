var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var morgan = require('morgan');
var User = require('./models/user');
var path = require('path');

// invoke an instance of express application.
var app = express();

app.use(express.static(path.join(__dirname, 'public')));

// set our application port
app.set('port', 9000);

// set morgan to log info about our requests for development use.
app.use(morgan('dev'));

// initialize body-parser to parse incoming parameters requests to req.body
app.use(bodyParser.urlencoded({ extended: true }));

// initialize cookie-parser to allow us access the cookies stored in the browser. 
app.use(cookieParser());

// initialize express-session to allow us track the logged-in user across sessions.
app.use(session({
  key: 'user_sid',
  secret: 'jfdkjfdkj43423jkj4r3j2k3jJKJ32DFSF#ddsddfdfdfsdccdf4232fdcxzz',
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: 600000
  }
}));


// This middleware will check if user's cookie is still saved in browser and user is not set, then automatically log the user out.
// This usually happens when you stop your express server after login, your cookie still remains saved in the browser.
app.use((req, res, next) => {
  if (req.cookies.user_sid && !req.session.user) {
    res.clearCookie('user_sid');        
  }
  next();
});

// middleware function to check for logged-in users
var sessionChecker = (req, res, next) => {
  if (req.session.user && req.cookies.user_sid) {
    res.redirect('/convert');
  } else {
    next();
  }    
};


// route for Home-Page
app.get('/', sessionChecker, (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// route for user signup
app.route('/signup')
  .get(sessionChecker, (req, res) => {
    res.sendFile(__dirname + '/public/signup.html');
  })
  .post((req, res) => {
    User.create({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      phonenumber: req.body.phonenumber,
      email: req.body.email,
      username: req.body.username,
      password: req.body.password
    })
    .then(user => {
      req.session.user = user.dataValues;
      res.redirect('/convert');
    })
    .catch(error => {
      res.redirect('/signup');
    });
  });

// route for user Login
app.route('/login')
  .get(sessionChecker, (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
  })
  .post((req, res) => {
    var username = req.body.username,
        password = req.body.password;

    User.findOne({ where: { username: username } }).then(function (user) {
      if (!user) {
        res.redirect('/login');
      } 
      else if (!user.validPassword(password)) {
        res.redirect('/login');
      } else {
        req.session.user = user.dataValues;
        res.redirect('/convert');
      }
    });
  });


app.get('/convert', (req, res) => {
  if (req.session.user && req.cookies.user_sid) {
    res.sendFile(__dirname + '/public/convert.html');
  } else {
    res.redirect('/');
  }
});


app.get('/help', (req, res) => {  
  res.sendFile(__dirname + '/public/help.html');
});


app.get('/dictionary', (req, res) => {
  if (req.session.user && req.cookies.user_sid) {
    res.sendFile(__dirname + '/public/dictionary.html');
  } else {
    res.redirect('/');
  }
});


// route for user logout
app.get('/logout', (req, res) => {
  if (req.session.user && req.cookies.user_sid) {
    res.clearCookie('user_sid');
    res.redirect('/');
  } else {
    res.redirect('/login');
  }
});


// route for handling 404 requests(unavailable routes)
app.use(function (req, res, next) {
  res.status(404).send("Sorry can't find that!")
});


// start the express server
app.listen(app.get('port'), () => console.log(`App started on port ${app.get('port')}`));

