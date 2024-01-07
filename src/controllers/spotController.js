const { body, validationResult } = require('express-validator');
const { Spot, Forecast, ForecastInfo } = require('../models');

// Helper function to send error response
const sendError = (res, message) => res.status(400).json({ message });

const nameValidator = body('name')
  .trim()
  .isLength({ min: 3 })
  .withMessage('Spot name must be at least 3 chars long')
  .isLength({ max: 50 })
  .withMessage('Spot name cant be no longer than 50 chars')
  .escape();

const latValidator = body('lat')
  .trim()
  .isNumeric()
  .withMessage('Latitude must be a number')
  .escape();

const lonValidator = body('lon')
  .trim()
  .isNumeric()
  .withMessage('Longitude must be a number')
  .escape();

exports.spotListGet = async (req, res) => {
  try {
    const spots = await Spot.find({
      forecast: { $exists: true, $not: { $size: 0 } },
    }).select('_id name searchName lat lon windDirections').sort('name');
    res.status(200).json({ spots });
  } catch {
    sendError(res, 'failed to find any spots');
  }
};

exports.createSpotPost = [
  nameValidator,
  latValidator,
  lonValidator,
  async (req, res) => {
    try {
      const spot = new Spot(req.body);
      await spot.save();
      res.status(201).json({ spot });
    } catch {
      sendError(res, 'failed to create new Spot');
    }
  },
];

exports.spotGet = async (req, res) => {
  try {
    const spot = await Spot.findById(req.params.id);
    spot ? res.status(200).json({ spot }) : sendError(res, 'Spot not found');
  } catch {
    sendError(res, 'failed to find that spot');
  }
};

exports.spotByNameGet = async (req, res) => {
  try {
    const spot = await Spot.findOne({ searchName: req.params.name });
    spot ? res.status(200).json({ spot }) : sendError(res, 'Spot not found');
  } catch {
    sendError(res, 'failed to find that spot');
  }
};

exports.spotDelete = async (req, res) => {
  try {
    const spot = await Spot.findById(req.params.id);
    if (spot) {
      await spot.remove();
      res.status(200).json({ message: 'Spot deleted' });
    } else {
      sendError(res, 'Spot not found');
    }
  } catch {
    sendError(res, 'failed to delete spot');
  }
};

exports.spotPut = [
  nameValidator,
  latValidator,
  lonValidator,
  async (req, res) => {
    try {
      const spot = await Spot.findById(req.params.id);
      if (spot) {
        Object.assign(spot, req.body);
        await spot.save();
        res.status(200).json({ spot });
      } else {
        sendError(res, 'Spot not found');
      }
    } catch {
      sendError(res, 'failed to change spot');
    }
  },
];

exports.spotForecastGet = async (req, res) => {
  try {
    const spot = await Spot.findById(req.params.id).select(
      '_id name lat lon windDirections forecast',
    );

    const spotForecast = {
      _id: spot._id,
      name: spot.name,
      lat: spot.lat,
      lon: spot.lon,
      windDirections: spot.windDirections,
      forecast: spot.forecast,
    };

    spot
      ? res.status(200).json({ spot: spotForecast })
      : sendError(res, 'Spot not found');
  } catch {
    sendError(res, 'failed to find that spot');
  }
};

exports.spotForecastByNameGet = async (req, res) => {
  try {
    const spot = await Spot.findOne({ searchName: req.params.name }).select(
      '_id name lat lon windDirections forecast',
    );

    const spotForecast = {
      _id: spot._id,
      name: spot.name,
      lat: spot.lat,
      lon: spot.lon,
      windDirections: spot.windDirections,
      forecast: spot.forecast,
    };

    spot
      ? res.status(200).json({ spot: spotForecast })
      : sendError(res, 'Spot not found');
  } catch {
    sendError(res, 'failed to find that spot');
  }
};

exports.addSpotPost = [
  nameValidator,
  latValidator,
  lonValidator,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors });
      } else {
        const spot = await Spot.findOne({ searchName: req.body.name });
        if (spot) {
          res.status(200).json({ spot });
        } else {
          const spot = new Spot(req.body);
          await spot.save();
          res.status(201).json({ spot });
        }
      }
    } catch {
      sendError(res, 'failed to create new Spot');
    }
  },
];
