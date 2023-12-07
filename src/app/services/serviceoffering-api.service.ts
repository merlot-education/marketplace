import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { lastValueFrom } from 'rxjs';
import { IOfferings, IPageBasicOfferings } from '../views/serviceofferings/serviceofferings-data';
import { ActiveOrganizationRoleService } from './active-organization-role.service';

@Injectable({
  providedIn: 'root'
})
export class ServiceofferingApiService {

  private friendlyStatusNames = {
    "IN_DRAFT": "In Bearbeitung",
    "RELEASED": "Veröffentlicht",
    "REVOKED": "Widerrufen",
    "DELETED": "Gelöscht",
    "ARCHIVED": "Archiviert"
  }

  private friendlyTypeNames = {
    "merlot:MerlotServiceOfferingSaaS": "Webanwendung",
    "merlot:MerlotServiceOfferingDataDelivery": "Datenlieferung",
    "merlot:MerlotServiceOfferingCooperation": "Kooperationsvertrag"
  }

  constructor(private http: HttpClient, private activeOrgRoleService: ActiveOrganizationRoleService) { 

  }

  // get released service offering overview (unauthenticated)
  public async fetchPublicServiceOfferings(page: number, size: number, state?: string): Promise<IPageBasicOfferings> {
    let target_url = environment.serviceoffering_api_url + "?page=" + page + "&size=" + size
    if (state !== undefined) {
      target_url += "&state=" + state
    }
    return await lastValueFrom(this.http.get(target_url)) as IPageBasicOfferings;
  }

  // get all service offerings for the active organization
  public async fetchOrganizationServiceOfferings(page: number, size: number, state?: string): Promise<IPageBasicOfferings> {
    if (this.activeOrgRoleService.isLoggedIn) {
      let activeOrgaId = this.activeOrgRoleService.getActiveOrgaId().replace("Participant:", "");
      let target_url = environment.serviceoffering_api_url + "organization/" + activeOrgaId + "?page=" + page + "&size=" + size;
      if (state !== undefined) {
        target_url += "&state=" + state
      }
      return await lastValueFrom(this.http.get(target_url)) as IPageBasicOfferings;
    }
      
    return undefined;
  }

  // get details to a specific service offering (authenticated)
  public async fetchServiceOfferingDetails(id: string): Promise<IOfferings> {
    if (this.activeOrgRoleService.isLoggedIn) {
      return await lastValueFrom(this.http.get(environment.serviceoffering_api_url + "serviceoffering/" + id)) as IOfferings;
    }
      
    return undefined;
  }

  // publish a new service offering with the specified self description and set it to "in draft"
  public async createServiceOffering(sdJson: string, type: string) {
    console.log(sdJson); 
    console.log(type);
    const headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8');
    return await lastValueFrom(this.http.post(environment.serviceoffering_api_url + "serviceoffering/" + type, sdJson, {headers: headers}));
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

  public async purgeServiceOffering(id: string) {
    return await lastValueFrom(this.http.patch(this.getStatusShiftUrl(id, "PURGED"), null));
  }

  public async inDraftServiceOffering(id: string) {
    return await lastValueFrom(this.http.patch(this.getStatusShiftUrl(id, "IN_DRAFT"), null));
  }

  public async regenerateServiceOffering(id: string) {
    return await lastValueFrom(this.http.post(environment.serviceoffering_api_url + "serviceoffering/regenerate/" + id, null));
  }

  public async fetchAvailableShapes(system: string): Promise<any> {
    return await lastValueFrom(this.http.get(`${environment.wizard_api_url}/getAvailableShapesCategorized?ecoSystem=`+system));
  }

  public async fetchShape(filename: string): Promise<any> {
    const params = new HttpParams().set('name', filename);
    return await lastValueFrom(this.http.get(`${environment.wizard_api_url}/getJSON`, {params}));
  }

  public resolveFriendlyStatusName(merlotStatus: string): string {
    return this.friendlyStatusNames[merlotStatus] ? this.friendlyStatusNames[merlotStatus] : "Unbekannt";
  }

  public resolveFriendlyTypeName(offeringType: string): string {
    return this.friendlyTypeNames[offeringType] ? this.friendlyTypeNames[offeringType] : "Unbekannt";
  }

}
