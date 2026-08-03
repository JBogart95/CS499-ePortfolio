const express = require('express');
const { expressjwt: jwt } = require('express-jwt');
const authController = require('../controllers/authentication');
const tripsController = require('../controllers/trips');

const router = express.Router();
const auth = jwt({
  secret: process.env.JWT_SECRET,
  requestProperty: 'auth',
  algorithms: ['HS256']
});

router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/user', auth, tripsController.getUser);

router
  .route('/trips')
  .get(tripsController.getAllTrips)
  .post(auth, tripsController.tripsAddTrip);

router
  .route('/trip/:tripCode')
  .get(tripsController.getTripByCode)
  .put(auth, tripsController.tripsUpdateTrip)
  .delete(auth, tripsController.tripsDeleteTrip);

module.exports = router;
