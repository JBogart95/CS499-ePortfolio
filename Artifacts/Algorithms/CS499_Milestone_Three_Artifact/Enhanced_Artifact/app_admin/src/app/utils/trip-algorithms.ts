import { Trip } from '../../../models/trip';

export type TripSortOption =
  'name-asc' |
  'name-desc' |
  'price-asc' |
  'price-desc' |
  'date-asc' |
  'date-desc' |
  'length-asc' |
  'length-desc';

export interface TripFilterOptions {
  searchTerm: string;
  resort: string;
  minimumPrice: number | null;
  maximumPrice: number | null;
  sortOption: TripSortOption;
}

/**
 * Contains reusable algorithms for searching, filtering, sorting, indexing,
 * and paging trip records without mutating the source collection.
 */
export class TripAlgorithms {
  public static processTrips(trips: Trip[], options: TripFilterOptions): Trip[] {
    const normalizedSearch = TripAlgorithms.normalize(options.searchTerm);
    const normalizedResort = TripAlgorithms.normalize(options.resort);

    // Search and filters are intentionally combined into one O(n) traversal.
    const filtered = trips.filter(trip => {
      const searchableText = [trip.code, trip.name, trip.resort]
        .map(value => TripAlgorithms.normalize(value))
        .join(' ');
      const price = TripAlgorithms.toNumber(trip.perPerson);

      const matchesSearch = !normalizedSearch || searchableText.indexOf(normalizedSearch) >= 0;
      const matchesResort = !normalizedResort ||
        TripAlgorithms.normalize(trip.resort) === normalizedResort;
      const meetsMinimum = options.minimumPrice === null || price >= options.minimumPrice;
      const meetsMaximum = options.maximumPrice === null || price <= options.maximumPrice;

      return matchesSearch && matchesResort && meetsMinimum && meetsMaximum;
    });

    return TripAlgorithms.mergeSort(filtered, TripAlgorithms.comparator(options.sortOption));
  }

  /** Builds a sorted list of unique resorts in O(n log n) overall time. */
  public static getUniqueResorts(trips: Trip[]): string[] {
    const resortIndex = new Set<string>();
    trips.forEach(trip => {
      const resort = (trip.resort || '').trim();
      if (resort) {
        resortIndex.add(resort);
      }
    });

    return TripAlgorithms.mergeSort(
      Array.from(resortIndex),
      (left, right) => left.toLowerCase().localeCompare(right.toLowerCase())
    );
  }

  /** Returns a page using array slicing, which is O(k) for page size k. */
  public static paginate<T>(items: T[], page: number, pageSize: number): T[] {
    const safePageSize = Math.max(1, pageSize);
    const safePage = Math.max(1, page);
    const startIndex = (safePage - 1) * safePageSize;
    return items.slice(startIndex, startIndex + safePageSize);
  }

  public static totalPages(itemCount: number, pageSize: number): number {
    return Math.max(1, Math.ceil(itemCount / Math.max(1, pageSize)));
  }

  /** Stable merge sort with O(n log n) time and O(n) auxiliary space. */
  public static mergeSort<T>(items: T[], compare: (left: T, right: T) => number): T[] {
    if (items.length <= 1) {
      return items.slice();
    }

    const midpoint = Math.floor(items.length / 2);
    const left = TripAlgorithms.mergeSort(items.slice(0, midpoint), compare);
    const right = TripAlgorithms.mergeSort(items.slice(midpoint), compare);
    return TripAlgorithms.merge(left, right, compare);
  }

  private static merge<T>(
    left: T[],
    right: T[],
    compare: (leftItem: T, rightItem: T) => number
  ): T[] {
    const result: T[] = [];
    let leftIndex = 0;
    let rightIndex = 0;

    while (leftIndex < left.length && rightIndex < right.length) {
      // <= preserves the original order of equal values, making the sort stable.
      if (compare(left[leftIndex], right[rightIndex]) <= 0) {
        result.push(left[leftIndex++]);
      } else {
        result.push(right[rightIndex++]);
      }
    }

    return result
      .concat(left.slice(leftIndex))
      .concat(right.slice(rightIndex));
  }

  private static comparator(sortOption: TripSortOption): (left: Trip, right: Trip) => number {
    switch (sortOption) {
      case 'name-desc':
        return (left, right) => TripAlgorithms.compareText(right.name, left.name);
      case 'price-asc':
        return (left, right) => TripAlgorithms.toNumber(left.perPerson) -
          TripAlgorithms.toNumber(right.perPerson);
      case 'price-desc':
        return (left, right) => TripAlgorithms.toNumber(right.perPerson) -
          TripAlgorithms.toNumber(left.perPerson);
      case 'date-asc':
        return (left, right) => new Date(left.start).getTime() - new Date(right.start).getTime();
      case 'date-desc':
        return (left, right) => new Date(right.start).getTime() - new Date(left.start).getTime();
      case 'length-asc':
        return (left, right) => TripAlgorithms.extractLength(left.length) -
          TripAlgorithms.extractLength(right.length);
      case 'length-desc':
        return (left, right) => TripAlgorithms.extractLength(right.length) -
          TripAlgorithms.extractLength(left.length);
      case 'name-asc':
      default:
        return (left, right) => TripAlgorithms.compareText(left.name, right.name);
    }
  }

  private static compareText(left: string, right: string): number {
    return TripAlgorithms.normalize(left).localeCompare(TripAlgorithms.normalize(right));
  }

  private static normalize(value: string): string {
    return (value || '').trim().toLowerCase();
  }

  private static toNumber(value: string): number {
    const parsed = Number(String(value).replace(/[^0-9.-]+/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  }

  private static extractLength(value: string): number {
    const match = String(value || '').match(/\d+(?:\.\d+)?/);
    return match ? Number(match[0]) : 0;
  }
}
