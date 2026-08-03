const mongoose = require('mongoose');
const Trip = mongoose.model('trips');
const User = mongoose.model('users');
const { validateTrip } = require('../helpers/trip-validator');

const requireAuthenticatedUser = async req => {
  const email = req.auth && req.auth.email;
  if (!email) { const error = new Error('Authentication is required.'); error.status = 401; throw error; }
  const user = await User.findOne({ email }).select('email name').lean().exec();
  if (!user) { const error = new Error('Authenticated user was not found.'); error.status = 404; throw error; }
  return user;
};

const sendControllerError = (res, error, fallbackMessage) => {
  if (error && error.code === 11000) return res.status(409).json({ message: 'A record with that unique value already exists.' });
  const status = error.status || (error.name === 'ValidationError' || error.name === 'CastError' ? 400 : 500);
  return res.status(status).json({ message: error.message || fallbackMessage });
};
const escapeRegex = value => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const boundedInteger = (value, fallback, maximum) => Math.min(Math.max(parseInt(value, 10) || fallback, 1), maximum);

const getUser = async (req, res) => {
  try { return res.status(200).json(await requireAuthenticatedUser(req)); }
  catch (error) { return sendControllerError(res, error, 'Unable to retrieve the user.'); }
};

const getAllTrips = async (req, res) => {
  try {
    const page = boundedInteger(req.query.page, 1, 100000);
    const limit = boundedInteger(req.query.limit, 25, 100);
    const query = {};
    if (req.query.resort) query.resort = new RegExp(`^${escapeRegex(req.query.resort.trim())}$`, 'i');
    if (req.query.search) {
      const search = new RegExp(escapeRegex(req.query.search.trim()), 'i');
      query.$or = [{ code: search }, { name: search }, { resort: search }, { description: search }];
    }
    if (req.query.minPrice || req.query.maxPrice) {
      query.perPerson = {};
      if (!Number.isNaN(Number(req.query.minPrice))) query.perPerson.$gte = Number(req.query.minPrice);
      if (!Number.isNaN(Number(req.query.maxPrice))) query.perPerson.$lte = Number(req.query.maxPrice);
    }
    const [trips, total] = await Promise.all([
      Trip.find(query).select('code name length start resort perPerson image description createdAt updatedAt').sort({ start: 1, name: 1 }).skip((page - 1) * limit).limit(limit).lean().exec(),
      Trip.countDocuments(query).exec()
    ]);
    const formattedTrips = trips.map(trip => ({ ...trip, length: `${trip.length} days`, perPerson: Number(trip.perPerson).toFixed(2) }));
    res.set('X-Total-Count', String(total));
    return res.status(200).json(formattedTrips);
  } catch (error) { return sendControllerError(res, error, 'Unable to retrieve trips.'); }
};

const getTripByCode = async (req, res) => {
  try {
    const trip = await Trip.findOne({ code: String(req.params.tripCode).trim().toUpperCase() }).lean().exec();
    if (!trip) return res.status(404).json({ message: 'Trip not found.' });
    return res.status(200).json({ ...trip, length: `${trip.length} days`, perPerson: Number(trip.perPerson).toFixed(2) });
  } catch (error) { return sendControllerError(res, error, 'Unable to retrieve the trip.'); }
};

const tripsAddTrip = async (req, res) => {
  try {
    await requireAuthenticatedUser(req);
    const validation = validateTrip(req.body);
    if (!validation.isValid) return res.status(400).json({ message: 'Trip validation failed.', errors: validation.errors });
    const trip = await Trip.create(validation.trip);
    return res.status(201).json(trip);
  } catch (error) { return sendControllerError(res, error, 'Unable to create the trip.'); }
};

const tripsUpdateTrip = async (req, res) => {
  try {
    await requireAuthenticatedUser(req);
    const validation = validateTrip(req.body);
    if (!validation.isValid) return res.status(400).json({ message: 'Trip validation failed.', errors: validation.errors });
    const trip = await Trip.findOneAndUpdate(
      { code: String(req.params.tripCode).trim().toUpperCase() },
      { $set: validation.trip },
      { new: true, runValidators: true, context: 'query' }
    ).exec();
    if (!trip) return res.status(404).json({ message: 'Trip not found.' });
    return res.status(200).json(trip);
  } catch (error) { return sendControllerError(res, error, 'Unable to update the trip.'); }
};

const tripsDeleteTrip = async (req, res) => {
  try {
    await requireAuthenticatedUser(req);
    const trip = await Trip.findOneAndDelete({ code: String(req.params.tripCode).trim().toUpperCase() }).exec();
    if (!trip) return res.status(404).json({ message: 'Trip not found.' });
    return res.status(200).json({ message: 'Trip deleted successfully.', trip });
  } catch (error) { return sendControllerError(res, error, 'Unable to delete the trip.'); }
};

module.exports = { getAllTrips, getTripByCode, tripsAddTrip, tripsUpdateTrip, tripsDeleteTrip, tripsFindCode: getTripByCode, getUser };
