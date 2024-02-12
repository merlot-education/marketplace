import { Injectable } from '@angular/core';
import { OrganizationsApiService } from './organizations-api.service';
import { ActiveOrganizationRoleService } from './active-organization-role.service';
import { IOrganizationData } from '../views/organization/organization-data';
import { OidcSecurityService } from 'angular-auth-oidc-client';

export interface OrganizationRole {
  orgaRoleString: string;
  roleName: string;
  roleFriendlyName: string;
  orgaData?: IOrganizationData;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private token: string = '';

  public finishedLoadingRoles = false;

  constructor(
    private organizationApiService: OrganizationsApiService,
    private activeOrgRoleService: ActiveOrganizationRoleService,
    private oidcSecurityService: OidcSecurityService,
  ) {
    this.activeOrgRoleService.isLoggedIn.subscribe((isLoggedIn) => {
      if (isLoggedIn) {
        console.log("rebuilding roles");
        // if logged in, update the roles of the user, load the profile and get the token
        switch (this.activeOrgRoleService.userData.Role) {
          case "dataport":
            this.buildOrganizationRoles(["OrgLegRep_did:web:marketplace.dev.merlot-education.eu#14e2471b-a276-3349-8a6e-caa941f9369b"]);
            break;
          case "capgemini":
            this.buildOrganizationRoles(["OrgLegRep_did:web:marketplace.dev.merlot-education.eu#1c092e75-4a75-3746-9c76-a737389e3e49"]);
            break;
          case "gaia":
            this.buildOrganizationRoles(["OrgLegRep_did:web:marketplace.dev.merlot-education.eu#c041ea73-3ecf-3a06-a5cd-919f5cef8e54"]);
            break;
          default:
            this.buildOrganizationRoles([]);
            break;
        }
      }
    });
  }

  public refreshActiveRoleOrgaData() {
    this.organizationApiService
      .getOrgaById(
        this.activeOrgRoleService.activeOrganizationRole.value.orgaData.selfDescription
          .verifiableCredential.credentialSubject['@id']
      )
      .then((result) => {
        this.activeOrgRoleService.organizationRoles[
          this.activeOrgRoleService.activeOrganizationRole.value.orgaRoleString
        ].orgaData = result;
        this.changeActiveOrgaRole(
          this.activeOrgRoleService.activeOrganizationRole.value.orgaRoleString
        );
      });
  }

  logOut() {
    this.oidcSecurityService
      .logoff()
      .subscribe((result) => console.log(result));
  }

  logIn() {
    this.oidcSecurityService.authorize();
  }

  public changeActiveOrgaRole(orgaRoleString: string) {
    this.activeOrgRoleService.changeActiveOrgaRole(orgaRoleString);
  }

  private buildOrganizationRoles(userRoles: string[]) {
    this.activeOrgRoleService.addOrganizationRoles(userRoles);

    let numOfOrgsToLoad = Object.keys(this.activeOrgRoleService.organizationRoles).length;
    this.finishedLoadingRoles = numOfOrgsToLoad === 0;

    // update organization data after building the list
    for (let orgaRoleKey in this.activeOrgRoleService.organizationRoles) {
      // try finding the organization of this role
      let orgaId: string = orgaRoleKey.split('_').slice(1).join('_'); // everything after the first part is the organization ID (which may include underscores again)
      this.organizationApiService.getOrgaById(orgaId).then((orga) => {
        this.activeOrgRoleService.organizationRoles[orgaRoleKey].orgaData = orga;

        numOfOrgsToLoad--;

        if (numOfOrgsToLoad == 0) {
          this.finishedLoadingRoles = true;
        }
      });
    }
  }
}
