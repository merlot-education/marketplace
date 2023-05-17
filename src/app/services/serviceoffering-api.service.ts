import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { IOfferings, IOfferingsDetailed } from '../views/serviceofferings/serviceofferings-data';
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
      let activeOrgaId = this.authService.activeOrganizationRole.value.orgaId;
      return await lastValueFrom(this.http.get(environment.serviceoffering_api_url + "/api/serviceofferings/organization/" + activeOrgaId)) as IOfferings[];
    }
      
    return [];
  }

  // get details to a specific service offering (authenticated)
  public async fetchServiceOfferingDetails(id: string): Promise<IOfferingsDetailed> {
    if (this.authService.isLoggedIn) {
      let activeOrgaId = this.authService.activeOrganizationRole.value.orgaId;
      return await lastValueFrom(this.http.get(environment.serviceoffering_api_url + "/api/serviceofferings/serviceoffering/" + id)) as IOfferingsDetailed;
    }
      
    return undefined;
  }

  // publish a new service offering with the specified self description and set it to "in draft"
  public async createServiceOffering(sdJson: string, type: string) {
    console.log(sdJson); 
    console.log(type);

    try {
      const headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8');
      let result = await lastValueFrom(this.http.post(environment.serviceoffering_api_url + "/api/serviceofferings/serviceoffering/" + type, sdJson, {headers: headers}));
      return result;
    } catch (e) {
      console.log(e);
      return undefined;
    }
  }


  // State machine
  public async releaseServiceOffering(id: string) {
    return await lastValueFrom(this.http.get(environment.serviceoffering_api_url + "/api/serviceofferings/serviceoffering/release/" + id));
  }

  public async revokeServiceOffering(id: string) {
    return await lastValueFrom(this.http.get(environment.serviceoffering_api_url + "/api/serviceofferings/serviceoffering/revoke/" + id));
  }

  public async deleteServiceOffering(id: string) {
    return await lastValueFrom(this.http.get(environment.serviceoffering_api_url + "/api/serviceofferings/serviceoffering/delete/" + id));
  }

  public async inDraftServiceOffering(id: string) {
    return await lastValueFrom(this.http.get(environment.serviceoffering_api_url + "/api/serviceofferings/serviceoffering/inDraft/" + id));
  }

  public fetchAvailableShapes(system: string) {
    return this.http.get(`${environment.wizard_api_url}/getAvailableShapesCategorized?ecoSystem=`+system);
  }

  public fetchShape(filename: string) {
    const params = new HttpParams().set('name', filename);
    return this.http.get(`${environment.wizard_api_url}/getJSON`, {params});
  }

}
