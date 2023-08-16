import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';
import { OrganizationsApiService } from './organizations-api.service';
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

  public isLoggedIn: boolean = false;
  public userProfile: KeycloakProfile = {};
  public organizationRoles: {
    [orgaRoleKey: string]: OrganizationRole;
  } = {};

  public activeOrganizationRole: BehaviorSubject<OrganizationRole> = new BehaviorSubject<OrganizationRole>({
    orgaRoleString: '',
    roleName: '',
    roleFriendlyName: ''
  });

  private roleFriendlyNameMapper: { [key: string]: string } = {
    OrgRep: 'Repräsentant',
    OrgLegRep: 'Prokurist',
  };

  constructor(
    private keycloakService: KeycloakService,
    private organizationApiService: OrganizationsApiService
  ) {
    this.keycloakService.isLoggedIn().then((result) => {
      this.isLoggedIn = result;
      // check if user is logged in, otherwise we do not set anything
      if (this.isLoggedIn) {
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

  logOut() {
    this.keycloakService.logout(window.location.origin);
  }

  logIn() {
    this.keycloakService.login({
      redirectUri: window.location.origin
    });
  }

  private getOrganizationRole(orgaRoleString: string): OrganizationRole {
    let role_arr: string[] = orgaRoleString.split('_');
    let roleName: string = role_arr[0]; // first part is the role name
    return {
      orgaRoleString: orgaRoleString,
      roleName: roleName,
      roleFriendlyName: this.roleFriendlyNameMapper[roleName]
    };
  }

  public changeActiveOrgaRole(orgaRoleString: string) {
    this.activeOrganizationRole.next(this.organizationRoles[orgaRoleString]);
  }

  private buildOrganizationRoles(userRoles: string[]) {
    for (let r of userRoles) {
      if (r.startsWith('OrgRep_') || r.startsWith('OrgLegRep_')) {
        let orgaRole = this.getOrganizationRole(r);
        this.organizationRoles[r] = orgaRole;
        // if the active Role is not set, set its initial value to the first role we see
        if (this.activeOrganizationRole.getValue().orgaRoleString === '') {
          this.activeOrganizationRole.next(this.organizationRoles[r]);
        }
      }
    }

    // update organization data after building the list
    for (let orgaRoleKey in this.organizationRoles) {
      // try finding the organization of this role
      let orgaId: string = orgaRoleKey.split('_').slice(1).join('_'); // everything after the first part is the organization ID (which may include underscores again)
      this.organizationApiService.getOrgaById(orgaId).then(orga => {
        this.organizationRoles[orgaRoleKey].orgaData = orga;
      });
    }
  }
}
