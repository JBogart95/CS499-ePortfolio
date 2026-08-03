const assert = require('assert');
const mongoose = require('mongoose');
require('../app_server/database/models/trips');
const Trip = mongoose.model('trips');

const validTrip = { code: ' sc-101 ', name: ' Coastal Escape ', length: '7 days', start: '2026-09-01', resort: ' Ocean Bay ', perPerson: '$1,299.00', image: 'coast.jpg', description: 'A complete coastal vacation package.' };
const trip = new Trip(validTrip);
const validationError = trip.validateSync();
assert.strictEqual(validationError, undefined);
assert.strictEqual(trip.code, 'SC-101');
assert.strictEqual(trip.length, 7);
assert.strictEqual(trip.perPerson, 1299);
assert.strictEqual(trip.resort, 'Ocean Bay');

const invalid = new Trip({ code: '!', name: 'A', length: 0, start: 'bad-date', resort: '', perPerson: -1, image: '', description: 'short' });
assert.ok(invalid.validateSync());
console.log('Database model validation tests passed.');
