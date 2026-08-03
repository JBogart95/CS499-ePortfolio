import { TripAlgorithms, TripFilterOptions } from './trip-algorithms';
import { Trip } from '../../../models/trip';

describe('TripAlgorithms', () => {
  const trips: Trip[] = [
    { _id: '1', code: 'A1', name: 'Zulu Escape', length: '7 days', start: new Date('2026-09-01'), resort: 'Ocean Bay', perPerson: '1500', image: '', description: '' },
    { _id: '2', code: 'B2', name: 'Alpine Adventure', length: '3 days', start: new Date('2026-08-01'), resort: 'Mountain Lodge', perPerson: '900', image: '', description: '' },
    { _id: '3', code: 'C3', name: 'Beach Weekend', length: '2 days', start: new Date('2026-07-15'), resort: 'Ocean Bay', perPerson: '700', image: '', description: '' }
  ];

  it('searches case-insensitively across name, code, and resort', () => {
    const options: TripFilterOptions = {
      searchTerm: 'ocean', resort: '', minimumPrice: null, maximumPrice: null, sortOption: 'name-asc'
    };
    expect(TripAlgorithms.processTrips(trips, options).length).toBe(2);
  });

  it('sorts by price without mutating the original array', () => {
    const options: TripFilterOptions = {
      searchTerm: '', resort: '', minimumPrice: null, maximumPrice: null, sortOption: 'price-asc'
    };
    const result = TripAlgorithms.processTrips(trips, options);
    expect(result[0].perPerson).toBe('700');
    expect(trips[0].perPerson).toBe('1500');
  });

  it('filters by a numeric price range', () => {
    const options: TripFilterOptions = {
      searchTerm: '', resort: '', minimumPrice: 800, maximumPrice: 1000, sortOption: 'name-asc'
    };
    expect(TripAlgorithms.processTrips(trips, options)[0].code).toBe('B2');
  });

  it('returns unique resorts in alphabetical order', () => {
    expect(TripAlgorithms.getUniqueResorts(trips)).toEqual(['Mountain Lodge', 'Ocean Bay']);
  });

  it('paginates a collection without changing the source', () => {
    expect(TripAlgorithms.paginate(trips, 2, 2)[0].code).toBe('C3');
    expect(trips.length).toBe(3);
  });
});
