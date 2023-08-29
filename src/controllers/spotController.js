const { body, validationResult } = require('express-validator');
const { Spot } = require('../models');

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
    const spots = await Spot.find();
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
    const spot = await Spot.findById(req.params.id)
      .populate({
        path: 'forecasts',
        populate: { path: 'forecastInfo' },
      })
      .exec();

    spot ? res.status(200).json({ spot }) : sendError(res, 'Spot not found');
  } catch {
    sendError(res, 'failed to find that spot');
  }
};