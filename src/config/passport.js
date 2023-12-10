const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require('passport-jwt');
require('dotenv/config');

const { User } = require('../models');

const JWTStrategy = passportJWT.Strategy;
const ExtrctJWT = passportJWT.ExtractJwt;

passport.use(
  'login',
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    (email, password, done) => {
      User.findOne({ email })
        .then((user) => {
          if (!user) {
            return done(null, false, {
              message: 'Incorrect email or password.',
            });
          }
          return user.isValidPassword(password).then((isValid) => {
            if (isValid) {
              return done(null, user, { message: 'Logged In Successfully' });
            }
            return done(null, false, {
              message: 'Incorrect email or password.',
            });
          });
        })
        .catch((err) => done(err));
    },
  ),
);

passport.use(
  'jwt',
  new JWTStrategy(
    {
      jwtFromRequest: ExtrctJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    (jwtPayload, done) => {
      User.findById(jwtPayload._id)
        .then((user) => done(null, user))
        .catch((err) => done(err));
    },
  ),
);
