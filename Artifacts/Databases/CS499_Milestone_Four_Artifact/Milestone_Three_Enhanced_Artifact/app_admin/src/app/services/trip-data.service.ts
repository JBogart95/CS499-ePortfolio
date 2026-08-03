import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';

import { Trip } from '../../../models/trip';
import { User } from '../models/user';
import { AuthResponse } from '../models/authresponse';
import { BROWSER_STORAGE } from '../storage';

@Injectable()
export class TripDataService {
  private readonly apiBaseUrl = 'http://localhost:3000/api';

  constructor(
    private http: HttpClient,
    @Inject(BROWSER_STORAGE) private storage: Storage
  ) { }

  private get authHeaders(): { headers: HttpHeaders } {
    const token = this.storage.getItem('travlr-token');
    return {
      headers: new HttpHeaders({ Authorization: `Bearer ${token || ''}` })
    };
  }

  public addTrip(formData: Trip): Promise<Trip> {
    return this.http
      .post<Trip>(`${this.apiBaseUrl}/trips`, formData, this.authHeaders)
      .toPromise()
      .catch(error => this.handleError(error));
  }

  public getTrip(tripCode: string): Promise<Trip> {
    return this.http
      .get<Trip>(`${this.apiBaseUrl}/trip/${encodeURIComponent(tripCode)}`)
      .toPromise()
      .catch(error => this.handleError(error));
  }

  public getTrips(): Promise<Trip[]> {
    return this.http
      .get<Trip[]>(`${this.apiBaseUrl}/trips`)
      .toPromise()
      .catch(error => this.handleError(error));
  }

  public updateTrip(formData: Trip): Promise<Trip> {
    return this.http
      .put<Trip>(
        `${this.apiBaseUrl}/trip/${encodeURIComponent(formData.code)}`,
        formData,
        this.authHeaders
      )
      .toPromise()
      .catch(error => this.handleError(error));
  }

  public deleteTrip(tripCode: string): Promise<any> {
    return this.http
      .delete<any>(
        `${this.apiBaseUrl}/trip/${encodeURIComponent(tripCode)}`,
        this.authHeaders
      )
      .toPromise()
      .catch(error => this.handleError(error));
  }

  public login(user: User): Promise<AuthResponse> {
    return this.makeAuthApiCall('login', user);
  }

  public register(user: User): Promise<AuthResponse> {
    return this.makeAuthApiCall('register', user);
  }

  private makeAuthApiCall(urlPath: string, user: User): Promise<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiBaseUrl}/${urlPath}`, user)
      .toPromise()
      .catch(error => this.handleError(error));
  }

  private handleError(error: HttpErrorResponse): Promise<never> {
    const apiMessage = error.error && error.error.message;
    const message = apiMessage || error.message || 'An unexpected application error occurred.';
    return Promise.reject(new Error(message));
  }
}
