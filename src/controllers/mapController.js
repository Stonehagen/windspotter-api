const { MapForecast, ForecastMap, ForecastInfo } = require('../models');

// Helper function to send error response
const sendError = (res, message) => res.status(400).json({ message });

exports.mapListGet = async (req, res) => {
  try {
    const mapForecasts = await MapForecast.find()
      .populate({
        path: 'forecastInfo',
        model: 'ForecastInfo',
      })
      .exec();
    res.status(200).json({ mapForecasts });
  } catch {
    sendError(res, 'failed to find any map');
  }
};

exports.mapForecastGet = async (req, res) => {
  try {
    const mapForecast = await MapForecast.findById(req.params.id);
    mapForecast
      ? res.status(200).json({ mapForecast })
      : sendError(res, 'Map not found');
  } catch {
    sendError(res, 'failed to find that map');
  }
};
