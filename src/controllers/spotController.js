/* eslint-disable no-underscore-dangle */
const { Spot } = require('../models');

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
