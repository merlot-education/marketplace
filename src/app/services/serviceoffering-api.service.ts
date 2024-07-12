/*
 *  Copyright 2023-2024 Dataport AöR
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { lastValueFrom } from 'rxjs';
import { IServiceOffering, IPageBasicOfferings } from '../views/serviceofferings/serviceofferings-data';
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
    "merlot:MerlotSaasServiceOffering": "Webanwendung",
    "merlot:MerlotDataDeliveryServiceOffering": "Datenlieferung",
    "merlot:MerlotCoopContractServiceOffering": "Kooperationsvertrag"
  }

  constructor(private http: HttpClient, private activeOrgRoleService: ActiveOrganizationRoleService) { 

  }

  private patchOrgaId(id: string) : string {
    return id.replace("#", "%23");  // encode hashtag
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
    if (this.activeOrgRoleService.isLoggedIn.value) {
      let activeOrgaId = this.activeOrgRoleService.getActiveOrgaId();
      let target_url = environment.serviceoffering_api_url + "organization/" + this.patchOrgaId(activeOrgaId) + "?page=" + page + "&size=" + size;
      if (state !== undefined) {
        target_url += "&state=" + state
      }
      return await lastValueFrom(this.http.get(target_url)) as IPageBasicOfferings;
    }
      
    return undefined;
  }

  // get details to a specific service offering (authenticated)
  public async fetchServiceOfferingDetails(id: string): Promise<IServiceOffering> {
    if (this.activeOrgRoleService.isLoggedIn.value) {
      return await lastValueFrom(this.http.get(environment.serviceoffering_api_url + "serviceoffering/" + id)) as IServiceOffering;
    }
      
    return undefined;
  }

  // publish a new service offering with the specified self description and set it to "in draft"
  public async createServiceOffering(sdJson: IServiceOffering) {
    console.log(sdJson); 
    return await lastValueFrom(this.http.post(environment.serviceoffering_api_url + "serviceoffering", sdJson));
  }

  public async updateServiceOffering(sdJson: IServiceOffering, id: string) {
    return await lastValueFrom(this.http.put(environment.serviceoffering_api_url + "serviceoffering/" + id, sdJson));
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

  public async getGxServiceOfferingShape(): Promise<any> {
    return await lastValueFrom(this.http.get(`${environment.serviceoffering_api_url}shapes/gx/serviceoffering`));
  }

  public async getMerlotServiceOfferingShape(): Promise<any> {
    return await lastValueFrom(this.http.get(`${environment.serviceoffering_api_url}shapes/merlot/serviceoffering`));
  }

  public async getSpecificOfferingTypeShape(type: string): Promise<any> {
    return await lastValueFrom(this.http.get(`${environment.serviceoffering_api_url}shapes/merlot/serviceoffering/${type}`));
  }

  public resolveFriendlyStatusName(merlotStatus: string): string {
    return this.friendlyStatusNames[merlotStatus] ? this.friendlyStatusNames[merlotStatus] : "Unbekannt";
  }

  public resolveFriendlyTypeName(offeringType: string): string {
    return this.friendlyTypeNames[offeringType] ? this.friendlyTypeNames[offeringType] : "Unbekannt";
  }

}
