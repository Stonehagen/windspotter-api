const { Router } = require('express');
const passport = require('passport');
const sessionController = require('../controllers/sessionController');

const router = Router();

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  sessionController.index,
);

module.exports = router;
