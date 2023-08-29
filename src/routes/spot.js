const { Router } = require('express');
const spotController = require('../controllers/spotController');

const router = Router();

router.get('/list', spotController.spotListGet);
router.post('/new', spotController.createSpotPost);
router.get('/:id', spotController.spotGet);
router.delete('/:id', spotController.spotDelete);
router.put('/:id', spotController.spotPut);

router.get('/:id/forecast', spotController.spotForecastGet);

module.exports = router;
