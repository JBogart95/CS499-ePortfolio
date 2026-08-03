const mongoose = require('mongoose');
const Trip = mongoose.model('trips');
const User = mongoose.model('users');
const { validateTrip } = require('../helpers/trip-validator');

/**
 * Confirms that an authenticated token belongs to a current user.
 * Returning the user also creates a reusable authorization boundary for
 * future role-based access control enhancements.
 */
const requireAuthenticatedUser = async req => {
  const email = req.auth && req.auth.email;
  if (!email) {
    const error = new Error('Authentication is required.');
    error.status = 401;
    throw error;
  }

  const user = await User.findOne({ email }).exec();
  if (!user) {
    const error = new Error('Authenticated user was not found.');
    error.status = 404;
    throw error;
  }

  return user;
};

const sendControllerError = (res, error, fallbackMessage) => {
  const status = error.status || (error.name === 'ValidationError' ? 400 : 500);
  const response = { message: error.message || fallbackMessage };

  // Database implementation details are deliberately not exposed to clients.
  return res.status(status).json(response);
};

const getUser = async (req, res) => {
  try {
    const user = await requireAuthenticatedUser(req);
    return res.status(200).json({ email: user.email });
  } catch (error) {
    return sendControllerError(res, error, 'Unable to retrieve the user.');
  }
};

const getAllTrips = async (req, res) => {
  try {
    const trips = await Trip.find({}).sort({ start: 1, name: 1 }).exec();
    return res.status(200).json(trips);
  } catch (error) {
    return sendControllerError(res, error, 'Unable to retrieve trips.');
  }
};

const getTripByCode = async (req, res) => {
  try {
    const trip = await Trip.findOne({ code: req.params.tripCode }).exec();
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found.' });
    }
    return res.status(200).json(trip);
  } catch (error) {
    return sendControllerError(res, error, 'Unable to retrieve the trip.');
  }
};

const tripsAddTrip = async (req, res) => {
  try {
    await requireAuthenticatedUser(req);
    const validation = validateTrip(req.body);

    if (!validation.isValid) {
      return res.status(400).json({
        message: 'Trip validation failed.',
        errors: validation.errors
      });
    }

    const existingTrip = await Trip.findOne({ code: validation.trip.code }).exec();
    if (existingTrip) {
      return res.status(409).json({ message: 'A trip with that code already exists.' });
    }

    const trip = await Trip.create(validation.trip);
    return res.status(201).json(trip);
  } catch (error) {
    return sendControllerError(res, error, 'Unable to create the trip.');
  }
};

const tripsUpdateTrip = async (req, res) => {
  try {
    await requireAuthenticatedUser(req);
    const validation = validateTrip(req.body);

    if (!validation.isValid) {
      return res.status(400).json({
        message: 'Trip validation failed.',
        errors: validation.errors
      });
    }

    const conflictingTrip = await Trip.findOne({
      code: validation.trip.code,
      _id: { $ne: req.body._id }
    }).exec();

    if (conflictingTrip) {
      return res.status(409).json({ message: 'A trip with that code already exists.' });
    }

    const trip = await Trip.findOneAndUpdate(
      { code: req.params.tripCode },
      validation.trip,
      { new: true, runValidators: true }
    ).exec();

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found.' });
    }

    return res.status(200).json(trip);
  } catch (error) {
    return sendControllerError(res, error, 'Unable to update the trip.');
  }
};

const tripsDeleteTrip = async (req, res) => {
  try {
    await requireAuthenticatedUser(req);
    const trip = await Trip.findOneAndDelete({ code: req.params.tripCode }).exec();

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found.' });
    }

    return res.status(200).json({
      message: 'Trip deleted successfully.',
      trip
    });
  } catch (error) {
    return sendControllerError(res, error, 'Unable to delete the trip.');
  }
};

// Retained as an alias for compatibility with the original route structure.
const tripsFindCode = getTripByCode;

module.exports = {
  getAllTrips,
  getTripByCode,
  tripsAddTrip,
  tripsUpdateTrip,
  tripsDeleteTrip,
  tripsFindCode,
  getUser
};
