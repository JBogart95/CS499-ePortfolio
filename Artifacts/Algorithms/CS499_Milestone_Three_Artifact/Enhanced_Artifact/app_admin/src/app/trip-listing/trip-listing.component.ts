import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TripDataService } from '../services/trip-data.service';
import { Trip } from '../../../models/trip';
import { AuthenticationService } from '../services/authentication.service';
import {
  TripAlgorithms,
  TripFilterOptions,
  TripSortOption
} from '../utils/trip-algorithms';

@Component({
  selector: 'app-trip-listing',
  templateUrl: './trip-listing.component.html',
  styleUrls: ['./trip-listing.component.css'],
  providers: [TripDataService]
})
export class TripListingComponent implements OnInit {
  trips: Trip[] = [];
  filteredTrips: Trip[] = [];
  visibleTrips: Trip[] = [];
  resorts: string[] = [];
  message = '';

  searchTerm = '';
  selectedResort = '';
  minimumPrice: number | null = null;
  maximumPrice: number | null = null;
  sortOption: TripSortOption = 'name-asc';

  currentPage = 1;
  pageSize = 6;
  totalPages = 1;

  constructor(
    private tripDataService: TripDataService,
    private authService: AuthenticationService,
    private router: Router
  ) { }

  public addTrip(): void {
    this.router.navigate(['add-trip']);
  }

  public isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  public ngOnInit(): void {
    this.loadTrips();
  }

  public applyAlgorithms(resetPage: boolean = true): void {
    if (resetPage) {
      this.currentPage = 1;
    }

    const options: TripFilterOptions = {
      searchTerm: this.searchTerm,
      resort: this.selectedResort,
      minimumPrice: this.minimumPrice,
      maximumPrice: this.maximumPrice,
      sortOption: this.sortOption
    };

    this.filteredTrips = TripAlgorithms.processTrips(this.trips, options);
    this.totalPages = TripAlgorithms.totalPages(this.filteredTrips.length, this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages);
    this.visibleTrips = TripAlgorithms.paginate(
      this.filteredTrips,
      this.currentPage,
      this.pageSize
    );
    this.message = this.filteredTrips.length === 0 ? 'No trips match the selected criteria.' : '';
  }

  public clearFilters(): void {
    this.searchTerm = '';
    this.selectedResort = '';
    this.minimumPrice = null;
    this.maximumPrice = null;
    this.sortOption = 'name-asc';
    this.applyAlgorithms(true);
  }

  public previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyAlgorithms(false);
    }
  }

  public nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyAlgorithms(false);
    }
  }

  public trackTrip(index: number, trip: Trip): string {
    return trip._id || trip.code || String(index);
  }

  private loadTrips(): void {
    this.message = 'Loading trips...';
    this.tripDataService.getTrips()
      .then(foundTrips => {
        this.trips = foundTrips || [];
        this.resorts = TripAlgorithms.getUniqueResorts(this.trips);
        this.applyAlgorithms(true);
      })
      .catch(error => {
        this.trips = [];
        this.filteredTrips = [];
        this.visibleTrips = [];
        this.message = error.message || 'Trips could not be loaded.';
      });
  }
}
