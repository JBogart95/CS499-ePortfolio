import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TripDataService } from '../services/trip-data.service';
import { Trip } from '../../../models/trip';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-trip-listing',
  templateUrl: './trip-listing.component.html',
  styleUrls: ['./trip-listing.component.css'],
  providers: [TripDataService]
})
export class TripListingComponent implements OnInit {
  trips: Trip[] = [];
  message = '';

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

  private loadTrips(): void {
    this.message = 'Loading trips...';
    this.tripDataService.getTrips()
      .then(foundTrips => {
        this.trips = foundTrips;
        this.message = foundTrips.length === 0 ? 'No trips found.' : '';
      })
      .catch(error => {
        this.trips = [];
        this.message = error.message || 'Trips could not be loaded.';
      });
  }
}
