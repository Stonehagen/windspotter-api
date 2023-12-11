const { Router } = require('express');
const userController = require('../controllers/userController');

const router = Router();

router.post('/sign-up', userController.createUserPost);
router.post('/sign-in', userController.logInUserPost);

module.exports = router;
