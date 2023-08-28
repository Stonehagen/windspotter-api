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

// const getAbsoluteLon = (lonStart, lonEnd) => {
//   return lonStart > lonEnd ? lonEnd + 360 : lonEnd;
// };

// const getGribIndex = (forecastInfo, spot) => {
//   // check if end value for longitute is lower than start value
//   const lo2 = getAbsoluteLon(forecastInfo.lo1, forecastInfo.lo2);
//   const spotLon = getAbsoluteLon(forecastInfo.lo1, spot.lon);

//   const latRow = (spot.lat - forecastInfo.la1) / forecastInfo.dy;
//   const latWidth = (lo2 - forecastInfo.lo1) / forecastInfo.dx + 1;
//   const lonPos = (spotLon - forecastInfo.lo1) / forecastInfo.dx;
//   return latRow * latWidth + lonPos;
// };
