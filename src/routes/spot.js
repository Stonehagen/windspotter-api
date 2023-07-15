const { Router } = require('express');
const spotController = require('../controllers/spotController');

const router = Router();

router.get(
  '/spot/:id',
  spotController.spotGet,
);

module.exports = router;
