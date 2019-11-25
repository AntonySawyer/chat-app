const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const app = express();

app.use(express.static('public'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use(session({
  secret: 'isSecretForChat',
  saveUninitialized: true,
  resave: true,
}));


const server = app.listen('3000', () => console.log('Server is running...'));

const io = require('socket.io')(server);

let newUserName = '';
let newUserId = '';

io.on('connection', (socket) => {
  socket.username = newUserName;
  socket.newUserId = newUserId;
  socket.on('user_connected', (data) => {
    socket.emit('user_data', {
      username: socket.username,
      id: socket.newUserId,
    })
  });

  socket.on('new_message', (data) => {
    io.sockets.emit('add_mess', {
      message: data.message,
      username: socket.username,
    });
  });

  socket.on('typing', (data) => {
    socket.broadcast.emit('typing', {
      username: socket.username,
    });
  });
});

const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/chat')
  .then(() => console.log('mongodb: connection successful'))
  .catch((err) => console.error(err));


const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
}, ((username, password, done) => {
  User.findOne({
      username,
    }, (err, user) => err ?
    done(err) :
    user ?
    password === user.password ?
    done(null, user) :
    done(null, false, {
      message: 'Incorrect password.'
    }) :
    done(null, false, {
      message: 'Incorrect username.'
    }));
})));


passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Passport:
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
  ((username, password, done) => {
    User.findOrCreate({
        username,
      }, {
        username,
        password,
      },
      (err, user) => {
        if (err) {
          return done(err);
        }

        if (!user) {
          return done(null, false);
        }
        if (user.doc.password !== password) {
          return done(null, false);
        }
        return done(null, user);
      });
  }),
));

// Auth system
app.post('/login', (req, res, next) => {
  passport.authenticate('local',
    (err, user, info) => err ?
    next(err) :
    user ?
    req.logIn(user, function (err) {
      console.log('in inner')
      return err ?
        next(err) :
        res.redirect('/chat');
    }) :
    res.redirect('/chat'))(req, res, next);
});

app.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

function mustAuthenticatedMw(req, res, next) {
  if (req.isAuthenticated()) {
      newUserName = req.user.doc.username;
      newUserId = req.user.doc._id;
    res.sendFile(path.join(`${__dirname}/public/chat.html`));

    } else {
      res.redirect('/');
    }
  }

  app.get('/chat', mustAuthenticatedMw);

  app.get('/', (req, res) => {
    res.sendFile(path.join(`${__dirname}/public/index.html`));
  });