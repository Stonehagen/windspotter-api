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

const firstNameValidator = body('firstName')
  .trim()
  .isLength({ min: 2 })
  .withMessage('First Name must be at least 2 chars long')
  .escape();

const lastNameValidator = body('lastName')
  .trim()
  .isLength({ min: 2 })
  .withMessage('Last Name must be at least 2 chars long')
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
  firstNameValidator,
  lastNameValidator,
  emailValidator,
  passwordValidator,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors);
    }
    try {
      const userFound = await User.findOne({ email: req.body.email });
      if (userFound) {
        return res.status(400).json(emailInUseError(userFound.email));
      }
      const user = new User({
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
