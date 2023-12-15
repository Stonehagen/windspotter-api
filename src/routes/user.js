const { Router } = require('express');
const passport = require('passport');
const userController = require('../controllers/userController');
require('../config/passport');

const router = Router();

router.post('/sign-up', userController.createUserPost);
router.post('/sign-in', userController.logInUserPost);
router.get(
  '/addFavorite',
  passport.authenticate('jwt', { session: false }),
  userController.addFavoritePost,
);

module.exports = router;
