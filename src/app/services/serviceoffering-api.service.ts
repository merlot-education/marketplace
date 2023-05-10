import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { IOfferings } from '../views/serviceofferings/serviceofferings-data';
import { OrganizationsApiService } from './organizations-api.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ServiceofferingApiService {

  constructor(private http: HttpClient, private authService: AuthService, private organizationsApiService: OrganizationsApiService) { 

  }

  // get released service offering overview (unauthenticated)
  public async fetchPublicServiceOfferings() {
    return await lastValueFrom(this.http.get(environment.serviceoffering_api_url + "/api/serviceofferings")) as IOfferings[];
  }

  // get all service offerings for the active organization
  public async fetchOrganizationServiceOfferings() {
    if (this.authService.isLoggedIn) {
      let activeOrgaId = this.authService.getOrganizationRole(this.authService.activeOrganizationRole.value).orgaId;
      return await lastValueFrom(this.http.get(environment.serviceoffering_api_url + "/api/serviceofferings/organization/" + activeOrgaId)) as IOfferings[];
    }
      
    return [];
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
