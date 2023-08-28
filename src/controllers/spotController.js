/* eslint-disable no-underscore-dangle */
const { body, validationResult } = require('express-validator');
const { Spot } = require('../models');

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
      return res.status(400).json({ message: 'Something went wrong' });
    }
  },
];

exports.spotGet = async (req, res) => {
  try {
    const spot = await Spot.findById(req.params.postId);

    if (!spot) {
      return res.status(400).json({ message: 'Spot not found' });
    }

    return res.status(200).json({ spot });
  } catch {
    return res.status(400).json({ message: 'Something went wrong' });
  }
};
