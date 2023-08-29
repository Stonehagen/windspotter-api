const { body, validationResult } = require('express-validator');
const { Spot } = require('../models');

exports.spotListGet = async (req, res) => {
  try {
    const spots = await Spot.find();
    return res.status(200).json({ spots });
  } catch {
    return res.status(400).json({ message: 'failed to find any spots' });
  }
};

exports.createSpotPost = [
  body('name')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Spot name must be at least 3 chars long')
    .isLength({ max: 50 })
    .withMessage('Spot name cant be no longer than 50 chars')
    .escape(),
  body('lat')
    .trim()
    .isNumeric()
    .withMessage('Latitude must be a number')
    .escape(),
  body('lon')
    .trim()
    .isNumeric()
    .withMessage('Longitude must be a number')
    .escape(),
  async (req, res) => {
    try {
      const spot = new Spot({
        name: req.body.name,
        lat: req.body.lat,
        lon: req.body.lon,
      });

      await spot.save();
      return res.status(201).json({ spot });
    } catch {
      return res.status(400).json({ message: 'failed to create new Spot' });
    }
  },
];

exports.spotGet = async (req, res) => {
  try {
    const spot = await Spot.findById(req.params.id);

    if (!spot) {
      return res.status(400).json({ message: 'Spot not found' });
    }

    return res.status(200).json({ spot });
  } catch {
    return res.status(400).json({ message: 'failed to find that spot' });
  }
};

exports.spotDelete = async (req, res) => {
  try {
    const spot = await Spot.findById(req.params.id);

    if (!spot) {
      return res.status(400).json({ message: 'Spot not found' });
    }

    await spot.remove();
    return res.status(200).json({ message: 'Spot deleted' });
  } catch {
    return res.status(400).json({ message: 'failed to delete spot' });
  }
};

exports.spotPut = [
  body('name')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Spot name must be at least 3 chars long')
    .isLength({ max: 50 })
    .withMessage('Spot name cant be no longer than 50 chars')
    .escape(),
  body('lat')
    .trim()
    .isNumeric()
    .withMessage('Latitude must be a number')
    .escape(),
  body('lon')
    .trim()
    .isNumeric()
    .withMessage('Longitude must be a number')
    .escape(),
  async (req, res) => {
    try {
      const spot = await Spot.findById(req.params.id);

      if (!spot) {
        return res.status(400).json({ message: 'Spot not found' });
      }

      spot.name = req.body.name;
      spot.lat = req.body.lat;
      spot.lon = req.body.lon;

      await spot.save();
      return res.status(200).json({ spot });
    } catch {
      return res.status(400).json({ message: 'failed to change spot' });
    }
  },
];

exports.SpotForecastGet = async (req, res) => {
  try {
    const spot = await Spot.findById(req.params.id);
    populate({
      path: 'forecasts',
      populate: { path: 'forecastInfo' },
    }).exec();

    if (!spot) {
      return res.status(400).json({ message: 'Spot not found' });
    }

    return res.status(200).json({ spot });
  } catch {
    return res.status(400).json({ message: 'failed to find that spot' });
  }
};
