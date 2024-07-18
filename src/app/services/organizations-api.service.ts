/*
 *  Copyright 2024 Dataport. All rights reserved. Developed as part of the MERLOT project.
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

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { ConnectorData, IOrganizationData, IPageOrganizations } from '../views/organization/organization-data';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OrganizationsApiService {

  private merlotFederationOrga: IOrganizationData = undefined;

  constructor(private http: HttpClient) {
    this.getOrgaById("did:web:" + environment.marketplace_url + ":participant:df15587a-0760-32b5-9c42-bb7be66e8076").then(result => {
      this.merlotFederationOrga = result;
    });
  }

  public getMerlotFederationOrga() {
    return this.merlotFederationOrga;
  }

  private patchOrgaId(id: string) : string {
    return id.replace("#", "%23");  // encode hashtag
  }

  public async fetchOrganizations(page: number, size: number): Promise<IPageOrganizations> {
    console.log("fetching organizations");
    // fetch data and cast it into interface
    let orgaData = (await lastValueFrom(
      this.http.get(environment.organizations_api_url + "?page=" + page + "&size=" + size)
    )) as IPageOrganizations;
    return orgaData;
  }

  public async getOrgaById(id: string): Promise<IOrganizationData> {
    return await (await lastValueFrom(
      this.http.get(environment.organizations_api_url + "organization/" + this.patchOrgaId(id))
    )) as IOrganizationData;
  }

  public async getMerlotParticipantShape(): Promise<any> {
    return await lastValueFrom(this.http.get(environment.organizations_api_url + "shapes/merlot/participant"));
  }

  public async getGxParticipantShape(): Promise<any> {
    return await lastValueFrom(this.http.get(environment.organizations_api_url + "shapes/gx/participant"));
  }

  public async getGxRegistrationNumberShape(): Promise<any> {
    return await lastValueFrom(this.http.get(environment.organizations_api_url + "shapes/gx/registrationnumber"));
  }

  public async getGxTermsAndConditions(): Promise<any> {
    return await lastValueFrom(this.http.get(environment.organizations_api_url + "shapes/gx/tnc"));
  }

  public async saveOrganization(sdJson: IOrganizationData): Promise<IOrganizationData> {
    console.log(sdJson);
    const headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8');
    return await lastValueFrom(this.http.put(environment.organizations_api_url + "organization", sdJson, {headers: headers})) as IOrganizationData;
  }

  public async fetchFederators(): Promise<IOrganizationData[]> {
    console.log("fetching federators");

    let federatorList = (await lastValueFrom(
      this.http.get(environment.organizations_api_url + "federators")
    )) as IOrganizationData[];
    return federatorList;
  }

  public async addOrganization(formData: FormData) {
    return await lastValueFrom(this.http.post(
      environment.organizations_api_url + "organization", formData)) as IOrganizationData;
  }
}
