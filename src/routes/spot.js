const { Router } = require('express');
const spotController = require('../controllers/spotController');

const router = Router();

router.get('/list', spotController.spotListGet);
router.post('/new', spotController.createSpotPost);
router.get('/name/:name', spotController.spotByNameGet);
router.get('/:id', spotController.spotGet);
router.delete('/:id', spotController.spotDelete);
router.put('/:id', spotController.spotPut);
router.post('/add', spotController.addSpotPost);
router.get('/search/:search', spotController.searchSpotGet);

router.get('/:id/forecast', spotController.spotForecastGet);
router.get('/name/:name/forecast', spotController.spotForecastByNameGet);

router.post('/day', spotController.ForecastsByDayPost);

module.exports = router;
