import { Injectable } from '@angular/core';
import { OrganizationsApiService } from './organizations-api.service';
import { ActiveOrganizationRoleService } from './active-organization-role.service';
import { IOrganizationData } from '../views/organization/organization-data';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { BehaviorSubject } from 'rxjs';

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

  public finishedLoadingRoles: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private organizationApiService: OrganizationsApiService,
    private activeOrgRoleService: ActiveOrganizationRoleService,
    private oidcSecurityService: OidcSecurityService,
  ) {
    this.activeOrgRoleService.isLoggedIn.subscribe((isLoggedIn) => {
      if (isLoggedIn) {
        console.log("rebuilding roles");
        console.log(this.activeOrgRoleService.userData);
        this.buildOrganizationRoles([(this.activeOrgRoleService.userData.Role + "_" + this.activeOrgRoleService.userData.issuerDID)]);
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
    this.finishedLoadingRoles.next(numOfOrgsToLoad === 0);

    // update organization data after building the list
    for (let orgaRoleKey in this.activeOrgRoleService.organizationRoles) {
      // try finding the organization of this role
      let orgaId: string = orgaRoleKey.split('_').slice(1).join('_'); // everything after the first part is the organization ID (which may include underscores again)
      this.organizationApiService.getOrgaById(orgaId).then((orga) => {
        this.activeOrgRoleService.organizationRoles[orgaRoleKey].orgaData = orga;

        numOfOrgsToLoad--;
        if (numOfOrgsToLoad == 0) {
          this.finishedLoadingRoles.next(true);
        }
      });
    }
  }
}
