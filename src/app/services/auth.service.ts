import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';
import { OrganizationsApiService } from './organizations-api.service';
import { ActiveOrganizationRoleService } from './active-organization-role.service';
import { IOrganizationData } from '../views/organization/organization-data';

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

  public userProfile: KeycloakProfile = {};

  public finishedLoadingRoles = false;

  constructor(
    private keycloakService: KeycloakService,
    private organizationApiService: OrganizationsApiService,
    private activeOrgRoleService: ActiveOrganizationRoleService
  ) {
    this.keycloakService.isLoggedIn().then((result) => {
      this.activeOrgRoleService.isLoggedIn = result;
      // check if user is logged in, otherwise we do not set anything
      if (this.activeOrgRoleService.isLoggedIn) {
        // if logged in, update the roles of the user, load the profile and get the token
        this.buildOrganizationRoles(this.keycloakService.getUserRoles());
        this.keycloakService.loadUserProfile().then((result) => {
          this.userProfile = result;
        });
        this.keycloakService.getToken().then((result) => {
          this.token = result;
        });
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
    this.keycloakService.logout(window.location.origin);
  }

  logIn() {
    this.keycloakService.login({
      redirectUri: window.location.origin,
    });
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
      }).catch(e => {
        console.log("failed to fetch organisation.", e);
        this.finishedLoadingRoles = true;
      });
    }
  }
}
