const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const passport = require('passport');
require('dotenv/config');

const { User } = require('../models');

const transporter = nodemailer.createTransport({
  host: 'smtps.udag.de',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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

      const verificationToken = jwt.sign(
        { email: req.body.email },
        process.env.JWT_SECRET,
        { expiresIn: '2d' },
      );
      const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        verificationToken,
      });
      await user.save();

      await transporter.sendMail({
        from: '"Windmate.de" <tobi@windmate.de>',
        to: user.email,
        subject: 'Welcome to Windmate.de',
        text: `Hi ${
          user.username
        },\n\nThanks for signing up to Windmate.de!\nPlease verify your email address by clicking the link below:\n\nhttps://windmate.de/verify/${user.verificationToken.replace(
          /\./g,
          '-',
        )}\n\nHappy Surfing!\n\nYour Windmate`,
      });
      res.status(201).json({ message: 'user created' });
    } catch {
      sendError(res, 'failed to create a new User');
    }
  },
];

exports.verifyUserPost = async (req, res) => {
  try {
    const user = await User.findOne({
      verificationToken: req.body.token.replace(/-/g, '.'),
    });
    if (user) {
      if (user.verified) {
        return res.status(400).json({
          errors: [
            {
              value: '',
              msg: 'User already verified',
              param: '',
              location: '',
            },
          ],
        });
      }
      user.verified = true;
      await user.save();
      res.status(200).json({ message: 'user verified' });
    } else {
      sendError(res, 'User not found');
    }
  } catch {
    sendError(res, 'failed to verify user');
  }
};

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

exports.getFavoritesGet = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites');
    if (user) {
      const favorites = user.favorites;
      res.status(200).json({ favorites });
    } else {
      sendError(res, 'User not found');
    }
  } catch {
    sendError(res, 'failed to get favorites');
  }
};

exports.addFavoritePost = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      const spotId = req.body.spotId;
      const favoriteCount = user.favorites.length;
      if (favoriteCount >= 20) {
        return res.status(400).json({
          errors: [
            {
              value: '',
              msg: 'You can only have 20 favorites. Please remove a favorite before adding another.',
              param: '',
              location: '',
            },
          ],
        });
      }
      const spotIndex = user.favorites.findIndex(
        (favorite) => favorite.toString() === spotId,
      );
      if (spotIndex === -1) {
        user.favorites.push(spotId);
        await user.save();
        res.status(200).json({ message: 'Spot added to favorites', user });
      } else {
        user.favorites.splice(spotIndex, 1);
        await user.save();
        res.status(200).json({ message: 'Spot removed from favorites', user });
      }
    } else {
      sendError(res, 'User not found');
    }
  } catch {
    sendError(res, 'failed to add favorite');
  }
};
