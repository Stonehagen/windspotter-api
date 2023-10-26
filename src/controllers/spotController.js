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

const getLastForecastDay = (forecast) => {
  return Object.keys(forecast).sort().reverse()[0];
};

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

exports.spotForecastByNameGet = async (req, res) => {
  try {
    const spot = await Spot.findOne({ searchName: req.params.name }).populate({
      path: 'forecasts',
      populate: { path: 'forecastInfo', model: 'ForecastInfo' },
    });

    // filter remap and sort forecasts

    // get the waveForecast cwam
    const waveForecast = spot.forecasts.filter(
      (forecast) => forecast.forecastInfo.name === 'cwam',
    )[0];

    // get the shortRangeWeather icon-d2
    const shortRangeWeather = {
      ...spot.forecasts.filter(
        (forecast) => forecast.forecastInfo.name === 'icon-d2',
      ),
    }[0];

    // get the midRangeWeather: Icon-eu
    const midRangeWeather = {
      ...spot.forecasts.filter(
        (forecast) => forecast.forecastInfo.name === 'icon-eu',
      ),
    }[0];

    const spotForecast = {
      name: spot.name,
      lat: spot.lat,
      lon: spot.lon,
      forecast: {
        mwd: waveForecast.mwd ? waveForecast.mwd : [],
        swh: waveForecast.swh ? waveForecast.swh : [],
        tm10: waveForecast.tm10 ? waveForecast.tm10 : [],
        t_2m: shortRangeWeather.t_2m ? shortRangeWeather.t_2m : [],
        v_10m: shortRangeWeather.v_10m ? shortRangeWeather.v_10m : [],
        u_10m: shortRangeWeather.u_10m ? shortRangeWeather.u_10m : [],
        vmax_10m: shortRangeWeather.vmax_10m ? shortRangeWeather.vmax_10m : [],
        clct_mod: shortRangeWeather.clct_mod ? shortRangeWeather.clct_mod : [],
        rain_con: shortRangeWeather.rain_con ? shortRangeWeather.rain_con : [],
      },
    };

    const midRangeForecast = {
      t_2m: midRangeWeather.t_2m ? midRangeWeather.t_2m : [],
      v_10m: midRangeWeather.v_10m ? midRangeWeather.v_10m : [],
      u_10m: midRangeWeather.u_10m ? midRangeWeather.u_10m : [],
      vmax_10m: midRangeWeather.vmax_10m ? midRangeWeather.vmax_10m : [],
      clct_mod: midRangeWeather.clct_mod ? midRangeWeather.clct_mod : [],
      rain_con: midRangeWeather.rain_con ? midRangeWeather.rain_con : [],
    };

    // go through the midRangeForecast
    // delete all days that are in the shortRangeForecast
    // combine the objects in short and midrange forecast
    for (const [key, value] of Object.entries(midRangeForecast)) {
      // get the end of the short forecast term
      const lastShortRangeForecastDay = getLastForecastDay(
        shortRangeWeather[key],
      );
      for (const [date, data] of Object.entries(value)) {
        if (
          new Date(date).getTime() >
          new Date(lastShortRangeForecastDay).getTime()
        ) {
          spotForecast.forecast[key][date] = data;
        }
      }
    }
    // ////longRangeWeather: Gfs - comming soon

    spot
      ? res.status(200).json({ spot: spotForecast })
      : sendError(res, 'Spot not found');
  } catch {
    sendError(res, 'failed to find that spot');
  }
};
