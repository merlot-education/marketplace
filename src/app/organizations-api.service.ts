import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { OrganizationData } from './views/organization/organization-data';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class OrganizationsApiService {
  public organizations: BehaviorSubject<OrganizationData[]> =
    new BehaviorSubject<OrganizationData[]>([]);

  constructor(private http: HttpClient, private authService: AuthService) {
    this.fetchOrganizations().then((result) => {
      // fetch the organization data from the organization orchestrator and store it
      this.organizations.next(result);

      // update the user roles with the organization names obtained from the api
      for (let roleKey in this.authService.organizationRoles) {
        // try finding the organization of this role
        let orga = this.getOrgaById(this.authService.organizationRoles[roleKey].orgaId);
        if (orga) {
          // if successful, update the orgaFriendlyName field of the respective role
          this.authService.organizationRoles[roleKey].orgaFriendlyName = orga.organizationName;
        }
      }

      // update the active and passive fields of each organization according to the user selected role
      // and make sure further updates are also applied
      authService.activeOrganizationRole.subscribe((value) =>
        this.updateOrganizationRepresentation(value)
      );
    });
  }

  public async fetchOrganizations() {
    console.log("fetching organizations");
    // fetch data and cast it into interface
    let orgaData = (await lastValueFrom(
      this.http.get('https://api.dev.merlot-education.eu/organisations/organizations')
    )) as OrganizationData[];
    return orgaData;
  }

  public updateOrganizationRepresentation(activeRoleKey: string) {
    // extract the ids of organizations that the user represents
    let userOrgaIds = [];
    for (let orga in this.authService.organizationRoles) {
      userOrgaIds.push(this.authService.organizationRoles[orga].orgaId);
    }

    // get the current state of organization data
    let orgas: OrganizationData[] = this.organizations.getValue();

    // iterate over organization data, update the active and passive field according to the currently selected role
    for (let orga of orgas) {
      orga.activeRepresentant =
        orga.merlotId ===
        this.authService.getOrganizationRole(activeRoleKey).orgaId;
      orga.passiveRepresentant = userOrgaIds.includes(orga.merlotId);
    }

    // update the current organization data
    this.organizations.next(orgas);
  }

  public getOrgaById(id: string): OrganizationData | undefined {
    // TODO consider using a dictionary based on the merlotId instead of a list for faster access
    for (let orga of this.organizations.getValue()) {
      if (orga.merlotId === id) {
        return orga;
      }
    }
    return undefined;
  }
}
