import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TripDataService } from '../services/trip-data.service';

@Component({
  selector: 'app-add-trip',
  templateUrl: './add-trip.component.html',
  styleUrls: ['./add-trip.component.css']
})
export class AddTripComponent implements OnInit {
  addForm: FormGroup;
  submitted = false;
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private tripService: TripDataService
  ) { }

  public ngOnInit(): void {
    this.addForm = this.formBuilder.group({
      _id: [],
      code: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9-]{2,20}$/)]],
      name: ['', [Validators.required, Validators.maxLength(100)]],
      length: ['', Validators.required],
      start: ['', Validators.required],
      resort: ['', [Validators.required, Validators.maxLength(100)]],
      perPerson: ['', Validators.required],
      image: ['', Validators.required],
      description: ['', [Validators.required, Validators.maxLength(2000)]]
    });
  }

  public onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (this.addForm.invalid) {
      return;
    }

    this.tripService.addTrip(this.addForm.value)
      .then(() => this.router.navigate(['list-trips']))
      .catch(error => {
        this.errorMessage = error.message || 'The trip could not be added.';
      });
  }

  public get f() {
    return this.addForm.controls;
  }
}
