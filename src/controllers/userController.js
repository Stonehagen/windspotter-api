const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const passport = require('passport');
require('dotenv/config');

const { User } = require('../models');

// Helper function to send error response
const sendError = (res, message) => res.status(400).json({ message });

const emailInUseError = (email) => ({
  errors: [
    {
      value: email,
      msg: 'Email already in use. Log in or use a different email.',
      param: 'email',
      location: 'body',
    },
  ],
});

const usernameInUseError = (username) => ({
  errors: [
    {
      value: username,
      msg: 'Username already in use. Use a different username.',
      param: 'username',
      location: 'body',
    },
  ],
});

const falseLoginError = () => ({
  errors: [
    {
      value: '',
      msg: "Sorry, we couldn't verify your login credentials. Please check your email and password and try again.",
      param: '',
      location: 'body',
    },
  ],
});

const undefinedError = () => ({
  errors: [
    {
      value: '',
      msg: 'Something went wrong. Please try again later!',
      param: '',
      location: '',
    },
  ],
});

const usernameValidator = body('username')
  .trim()
  .isLength({ min: 5 })
  .withMessage('Username must be at least 5 chars long')
  .escape();

const emailValidator = body('email')
  .trim()
  .isEmail()
  .withMessage('Please provide a valid Email')
  .escape();

const passwordValidator = body('password')
  .trim()
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 chars long')
  .matches(/\d/)
  .withMessage('Password must contain a number')
  .escape();

exports.createUserPost = [
  usernameValidator,
  emailValidator,
  passwordValidator,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors);
    }
    try {
      const emailFound = await User.findOne({ email: req.body.email });
      if (emailFound) {
        return res.status(400).json(emailInUseError(emailFound.email));
      }

      const usernameFound = await User.findOne({
        username: req.body.username,
      });
      if (usernameFound) {
        return res.status(400).json(usernameInUseError(usernameFound.username));
      }

      const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
      });
      await user.save();
      res.status(201).json({ message: 'user created' });
    } catch {
      sendError(res, 'failed to create a new User');
    }
  },
];

exports.logInUserPost = async (req, res) => {
  try {
    await new Promise((resolve, reject) => {
      passport.authenticate('login', { session: false }, (err, user) => {
        if (err || !user) {
          return res.status(401).json(falseLoginError());
        }
        req.login(user, { session: false }, (error) => {
          if (error) {
            res.status(400).json(undefinedError());
            reject(error);
          }
          const daysToExpire = 60;
          const token = jwt.sign(user.toJSON(), process.env.JWT_SECRET, {
            expiresIn: `${daysToExpire}d`,
          });
          res.json({ user, token });
          resolve();
        });
      })(req, res);
    });
  } catch {
    sendError(res, 'failed to log in');
  }
};

exports.addFavoritePost = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      const spotId = req.query.spotId;
      const spotIndex = user.favorites.findIndex(
        (favorite) => favorite.toString() === spotId,
      );
      if (spotIndex === -1) {
        user.favorites.push(spotId);
        await user.save();
        res.status(200).json({ message: 'Spot added to favorites' });
      } else {
        user.favorites.splice(spotIndex, 1);
        await user.save();
        res.status(200).json({ message: 'Spot removed from favorites' });
      }
    } else {
      sendError(res, 'User not found');
    }
  } catch {
    sendError(res, 'failed to add favorite');
  }
}