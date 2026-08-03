/**
 * Validates and normalizes trip data before it reaches the database layer.
 * Keeping validation in one module prevents duplicate controller logic and
 * provides consistent feedback to API clients.
 */
const REQUIRED_FIELDS = [
  'code',
  'name',
  'length',
  'start',
  'resort',
  'perPerson',
  'image',
  'description'
];

const cleanString = value => (typeof value === 'string' ? value.trim() : value);

const normalizeTrip = body => ({
  code: cleanString(body.code),
  name: cleanString(body.name),
  length: cleanString(body.length),
  start: body.start,
  resort: cleanString(body.resort),
  perPerson: cleanString(body.perPerson),
  image: cleanString(body.image),
  description: cleanString(body.description)
});

const validateTrip = body => {
  const trip = normalizeTrip(body || {});
  const missingFields = REQUIRED_FIELDS.filter(field => !trip[field]);
  const errors = [];

  if (missingFields.length > 0) {
    errors.push(`Missing required fields: ${missingFields.join(', ')}`);
  }

  if (trip.code && !/^[A-Za-z0-9-]{2,20}$/.test(trip.code)) {
    errors.push('Trip code must contain 2-20 letters, numbers, or hyphens.');
  }

  if (trip.start && Number.isNaN(Date.parse(trip.start))) {
    errors.push('Start date must be a valid date.');
  }

  if (trip.description && trip.description.length > 2000) {
    errors.push('Description must be 2,000 characters or fewer.');
  }

  return { isValid: errors.length === 0, errors, trip };
};

module.exports = { validateTrip };
