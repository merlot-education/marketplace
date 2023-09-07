import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { ConnectorData, IOrganizationData, IPageOrganizations } from '../views/organization/organization-data';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OrganizationsApiService {

  constructor(private http: HttpClient) {}

  public async fetchOrganizations(page: number, size: number): Promise<IPageOrganizations> {
    console.log("fetching organizations");
    // fetch data and cast it into interface
    let orgaData = (await lastValueFrom(
      this.http.get(environment.organizations_api_url + "?page=" + page + "&size=" + size)
    )) as IPageOrganizations;
    return orgaData;
  }

  public async getConnectorsOfOrganization(orgaId: string) {
    orgaId = orgaId.replace("Participant:", "");
    return await lastValueFrom(
      this.http.get(environment.organizations_api_url + "organization/" + orgaId + "/connectors/")
    ) as ConnectorData[];
  }

  public async getOrgaById(id: string): Promise<IOrganizationData> {
    return await (await lastValueFrom(
      this.http.get(environment.organizations_api_url + "organization/" + id)
    )) as IOrganizationData;
  }

  public async getMerlotParticipantShape(): Promise<any> {
    return await lastValueFrom(this.http.get(environment.organizations_api_url + "shapes/merlotParticipant"));
  }

  public async saveOrganization(sdJson: string, orgaId: string) {
    console.log(sdJson);
    const headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8');
    return await lastValueFrom(this.http.put(environment.organizations_api_url + "organization/" + orgaId, sdJson, {headers: headers}));
  }
}
