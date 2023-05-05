import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServiceofferingApiService {

  constructor(private http: HttpClient) { 

  }

  // get released service offering overview (unauthenticated)
  public async fetchPublicServiceOfferings() {

  }

  // get details to a specific service offering (authenticated)
  public async fetchServiceOfferingDetails(id: String) {

  }

  // publish a new service offering with the specified self description and set it to "in draft"
  public async createServiceOffering(sdJson: String) {
    console.log(sdJson); 
    const headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8');
    return await lastValueFrom(this.http.post(environment.serviceoffering_api_url + "/api/serviceofferings/serviceoffering", sdJson, {headers: headers}));
  }


  // State machine
  public async releaseServiceOffering(id: String) {

  }

  public async revokeServiceOffering(id: String) {

  }

  public async deleteServiceOffering(id: String) {

  }

  public async inDraftServiceOffering(id: String) {

  }

}
