const { Router } = require('express');
const mapController = require('../controllers/mapController');

const router = Router();

router.get('/', mapController.mapListGet);
router.get('/:id', mapController.mapForecastGet);


module.exports = router;
