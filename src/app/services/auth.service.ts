import { Injectable } from '@angular/core';
import { OrganizationsApiService } from './organizations-api.service';
import { ActiveOrganizationRoleService } from './active-organization-role.service';
import { IOrganizationData } from '../views/organization/organization-data';
import { OAuthService } from 'angular-oauth2-oidc';

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
    private oauthService: OAuthService
  ) {
    console.log(oauthService);
    this.activeOrgRoleService.isLoggedIn = oauthService.hasValidAccessToken();
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
  }

  logIn() {
    this.oauthService.loadDiscoveryDocumentAndTryLogin();
  }

  public changeActiveOrgaRole(orgaRoleString: string) {
    this.activeOrgRoleService.changeActiveOrgaRole(orgaRoleString);
  }

  private buildOrganizationRoles(userRoles: string[]) {
    this.activeOrgRoleService.addOrganizationRoles(userRoles);

    let numOfOrgsToLoad = Object.keys(this.activeOrgRoleService.organizationRoles).length;

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
