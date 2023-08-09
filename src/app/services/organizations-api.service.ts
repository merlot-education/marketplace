import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { ConnectorData, IOrganizationData, IPageOrganizations } from '../views/organization/organization-data';
import { AuthService, OrganizationRole } from './auth.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OrganizationsApiService {

  constructor(private http: HttpClient, private authService: AuthService) {

    // update the user roles with the organization names obtained from the api
    for (let roleKey in this.authService.organizationRoles) {
      // try finding the organization of this role
      this.getOrgaById(this.authService.organizationRoles[roleKey].orgaId).then(orga => {
        this.authService.organizationRoles[roleKey].orgaFriendlyName = orga.organizationName;
      });
    }

    // update the active and passive fields of each organization according to the user selected role
    // and make sure further updates are also applied
    /*authService.activeOrganizationRole.subscribe((value) =>
      this.updateOrganizationRepresentation(value)
    );*/
  }

  public async fetchOrganizations(page: number, size: number) {
    console.log("fetching organizations");
    // fetch data and cast it into interface
    let orgaData = (await lastValueFrom(
      this.http.get(environment.organizations_api_url + "?page=" + page + "&size=" + size)
    )) as IPageOrganizations;
    return orgaData;
  }

  public async getConnectorsOfOrganization(orgaId: string) {
    return await lastValueFrom(
      this.http.get(environment.organizations_api_url + "organization/" + orgaId + "/connectors/")
    ) as ConnectorData[];
  }

  /*public updateOrganizationRepresentation(activeRole: OrganizationRole) {
    // extract the ids of organizations that the user represents
    let userOrgaIds = [];
    for (let orga in this.authService.organizationRoles) {
      userOrgaIds.push(this.authService.organizationRoles[orga].orgaId);
    }

    // get the current state of organization data
    let orgas: IOrganizationData[] = this.organizations.getValue();

    // iterate over organization data, update the active and passive field according to the currently selected role
    for (let orga of orgas) {
      orga.activeRepresentant =
        orga.merlotId === activeRole.orgaId;
      orga.passiveRepresentant = userOrgaIds.includes(orga.merlotId);
    }

    // update the current organization data
    this.organizations.next(orgas);
  }*/

  public async getOrgaById(id: string): Promise<IOrganizationData> {
    return await (await lastValueFrom(
      this.http.get(environment.organizations_api_url + "organization/" + id)
    )) as IOrganizationData;
  }
}
