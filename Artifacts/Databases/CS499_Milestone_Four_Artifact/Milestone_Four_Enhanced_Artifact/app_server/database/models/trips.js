const mongoose = require('mongoose');

const normalizeText = value => typeof value === 'string' ? value.trim() : value;
const normalizeCode = value => typeof value === 'string' ? value.trim().toUpperCase() : value;
const parsePrice = value => {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return value;
  return Number(value.replace(/[$,]/g, '').trim());
};
const parseTripLength = value => {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return value;
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : value;
};

const tripSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Trip code is required.'],
    unique: true,
    uppercase: true,
    trim: true,
    minlength: 2,
    maxlength: 20,
    match: [/^[A-Z0-9-]+$/, 'Trip code may contain only letters, numbers, and hyphens.'],
    set: normalizeCode
  },
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100, set: normalizeText },
  length: { type: Number, required: true, min: 1, max: 365, set: parseTripLength },
  start: { type: Date, required: true, index: true },
  resort: { type: String, required: true, trim: true, minlength: 2, maxlength: 100, set: normalizeText },
  perPerson: { type: Number, required: true, min: 0, max: 1000000, set: parsePrice },
  image: { type: String, required: true, trim: true, maxlength: 255, set: normalizeText },
  description: { type: String, required: true, trim: true, minlength: 10, maxlength: 2000, set: normalizeText }
}, {
  timestamps: true,
  versionKey: false,
  collection: 'trips'
});

// Compound indexes support the most common list and resort/date queries.
tripSchema.index({ resort: 1, start: 1 });
tripSchema.index({ name: 1, start: 1 });
tripSchema.index({ perPerson: 1 });

tripSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.length = `${returnedObject.length} days`;
    returnedObject.perPerson = returnedObject.perPerson.toFixed(2);
    return returnedObject;
  }
});

module.exports = mongoose.model('trips', tripSchema);
