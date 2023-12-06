import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { ConnectorData, IOrganizationData, IPageOrganizations } from '../views/organization/organization-data';
import { ActiveOrganizationRoleService } from 'src/app/services/active-organization-role.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OrganizationsApiService {

  private merlotFederationOrga: IOrganizationData = undefined;

  constructor(private http: HttpClient, protected activeOrgRoleService: ActiveOrganizationRoleService) {
    this.getOrgaById("Participant:99").then(result => {
      this.merlotFederationOrga = result;
    });
  }

  private getActiveRoleHeaders() : HttpHeaders {
    return new HttpHeaders({'Active-Role' : this.activeOrgRoleService.activeOrganizationRole.value.orgaRoleString });
  }

  public getMerlotFederationOrga() {
    return this.merlotFederationOrga;
  }

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
    const headers = this.getActiveRoleHeaders().set('Content-Type', 'application/json; charset=utf-8');
    return await lastValueFrom(this.http.put(environment.organizations_api_url + "organization/" + orgaId, sdJson, {headers: headers}));
  }

  public async fetchFederators(page: number, size: number): Promise<IPageOrganizations> {
    console.log("fetching federators");

    let orgaData = (await lastValueFrom(
      this.http.get(environment.organizations_api_url + "federators")
    )) as IPageOrganizations;
    return orgaData;
  }

  public async addOrganization(formData: FormData) {
    return await lastValueFrom(this.http.post(
      environment.organizations_api_url + "organization", formData, {headers: this.getActiveRoleHeaders()})) as IOrganizationData;
  }
}
