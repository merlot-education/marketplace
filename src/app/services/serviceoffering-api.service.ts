import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, lastValueFrom } from 'rxjs';
import { IOfferingsDetailed, IPageOfferings } from '../views/serviceofferings/serviceofferings-data';
import { OrganizationsApiService } from './organizations-api.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ServiceofferingApiService {

  constructor(private http: HttpClient, private authService: AuthService, private organizationsApiService: OrganizationsApiService) { 

  }

  // get released service offering overview (unauthenticated)
  public async fetchPublicServiceOfferings(page: number, size: number, state?: string): Promise<IPageOfferings> {
    let target_url = environment.serviceoffering_api_url + "?page=" + page + "&size=" + size
    if (state !== undefined) {
      target_url += "&state=" + state
    }
    return await lastValueFrom(this.http.get(target_url)) as IPageOfferings;
  }

  // get all service offerings for the active organization
  public async fetchOrganizationServiceOfferings(page: number, size: number, state?: string): Promise<IPageOfferings> {
    if (this.authService.isLoggedIn) {
      let activeOrgaId = this.authService.activeOrganizationRole.value.orgaId;
      let target_url = environment.serviceoffering_api_url + "organization/" + activeOrgaId + "?page=" + page + "&size=" + size;
      if (state !== undefined) {
        target_url += "&state=" + state
      }
      return await lastValueFrom(this.http.get(target_url)) as IPageOfferings;
    }
      
    return undefined;
  }

  // get details to a specific service offering (authenticated)
  public async fetchServiceOfferingDetails(id: string): Promise<IOfferingsDetailed> {
    if (this.authService.isLoggedIn) {
      return await lastValueFrom(this.http.get(environment.serviceoffering_api_url + "serviceoffering/" + id)) as IOfferingsDetailed;
    }
      
    return undefined;
  }

  // publish a new service offering with the specified self description and set it to "in draft"
  public async createServiceOffering(sdJson: string, type: string) {
    console.log(sdJson); 
    console.log(type);

    try {
      const headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8');
      let result = await lastValueFrom(this.http.post(environment.serviceoffering_api_url + "serviceoffering/" + type, sdJson, {headers: headers}));
      return result;
    } catch (e) {
      console.log(e);
      return undefined;
    }
  }

  private getStatusShiftUrl(id: string, targetstatus: string) {
    return environment.serviceoffering_api_url + "serviceoffering/status/" + id + "/" + targetstatus;
  }


  // State machine
  public async releaseServiceOffering(id: string) {
    return await lastValueFrom(this.http.patch(this.getStatusShiftUrl(id, "RELEASED"), null));
  }

  public async revokeServiceOffering(id: string) {
    return await lastValueFrom(this.http.patch(this.getStatusShiftUrl(id, "REVOKED"), null));
  }

  public async deleteServiceOffering(id: string) {
    return await lastValueFrom(this.http.patch(this.getStatusShiftUrl(id, "DELETED"), null));
  }

  public async inDraftServiceOffering(id: string) {
    return await lastValueFrom(this.http.patch(this.getStatusShiftUrl(id, "IN_DRAFT"), null));
  }

  public fetchAvailableShapes(system: string): Observable<any> {
    return this.http.get(`${environment.wizard_api_url}/getAvailableShapesCategorized?ecoSystem=`+system);
  }

  public fetchShape(filename: string): Observable<any> {
    const params = new HttpParams().set('name', filename);
    return this.http.get(`${environment.wizard_api_url}/getJSON`, {params});
  }

}
