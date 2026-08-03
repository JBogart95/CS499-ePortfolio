import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TripDataService } from '../services/trip-data.service';

@Component({
  selector: 'app-delete-trip',
  templateUrl: './delete-trip.component.html',
  styleUrls: ['./delete-trip.component.css']
})
export class DeleteTripComponent implements OnInit {
  constructor(
    private router: Router,
    private tripService: TripDataService
  ) { }

  public ngOnInit(): void {
    const tripCode = localStorage.getItem('tripCode');
    if (!tripCode) {
      alert('The selected trip code could not be found.');
      this.router.navigate(['list-trips']);
      return;
    }

    this.tripService.deleteTrip(tripCode)
      .then(() => this.router.navigate(['list-trips']))
      .catch(error => {
        alert(error.message || 'The trip could not be deleted.');
        this.router.navigate(['list-trips']);
      });
  }
}
