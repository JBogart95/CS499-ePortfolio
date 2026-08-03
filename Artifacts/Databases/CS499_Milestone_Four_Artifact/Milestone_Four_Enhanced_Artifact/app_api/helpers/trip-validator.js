const REQUIRED_FIELDS = ['code', 'name', 'length', 'start', 'resort', 'perPerson', 'image', 'description'];
const cleanString = value => typeof value === 'string' ? value.trim() : value;
const numberFromValue = value => Number(String(value).replace(/[$,]/g, '').match(/\d+(\.\d+)?/)?.[0]);

const normalizeTrip = body => ({
  code: cleanString(body.code)?.toUpperCase(),
  name: cleanString(body.name),
  length: numberFromValue(body.length),
  start: body.start,
  resort: cleanString(body.resort),
  perPerson: numberFromValue(body.perPerson),
  image: cleanString(body.image),
  description: cleanString(body.description)
});

const validateTrip = body => {
  const trip = normalizeTrip(body || {});
  const errors = [];
  const missingFields = REQUIRED_FIELDS.filter(field => trip[field] === undefined || trip[field] === null || trip[field] === '' || Number.isNaN(trip[field]));
  if (missingFields.length) errors.push(`Missing or invalid required fields: ${missingFields.join(', ')}`);
  if (trip.code && !/^[A-Z0-9-]{2,20}$/.test(trip.code)) errors.push('Trip code must contain 2-20 letters, numbers, or hyphens.');
  if (trip.start && Number.isNaN(Date.parse(trip.start))) errors.push('Start date must be valid.');
  if (Number.isFinite(trip.length) && (trip.length < 1 || trip.length > 365)) errors.push('Trip length must be between 1 and 365 days.');
  if (Number.isFinite(trip.perPerson) && (trip.perPerson < 0 || trip.perPerson > 1000000)) errors.push('Price must be between 0 and 1,000,000.');
  if (trip.description && (trip.description.length < 10 || trip.description.length > 2000)) errors.push('Description must contain 10-2,000 characters.');
  return { isValid: errors.length === 0, errors, trip };
};
module.exports = { validateTrip, normalizeTrip };
