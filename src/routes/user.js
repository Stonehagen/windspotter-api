const { Router } = require('express');
const passport = require('passport');
const userController = require('../controllers/userController');
require('../config/passport');

const router = Router();

router.post('/sign-up', userController.createUserPost);
router.post('/sign-in', userController.logInUserPost);
router.post(
  '/addFavorite',
  passport.authenticate('jwt', { session: false }),
  userController.addFavoritePost,
);
router.get(
  '/favorites',
  passport.authenticate('jwt', { session: false }),
  userController.getFavorites,
);

module.exports = router;
