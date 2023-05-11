import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';
import { HttpClient } from '@angular/common/http';
import { HttpBackend } from '@angular/common/http';

export interface OrganizationRole {
  orgaRoleString: string;
  roleName: string;
  roleFriendlyName: string;
  orgaId: string;
  orgaFriendlyName: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private token: string = '';

  public isLoggedIn: boolean = false;
  public userProfile: KeycloakProfile = {};
  public organizationRoles: {
    [key: string]: OrganizationRole;
  } = {};

  //public activeOrganizationRole: BehaviorSubject<string> =
  //  new BehaviorSubject<string>('');

  public activeOrganizationRole: BehaviorSubject<OrganizationRole> = new BehaviorSubject<OrganizationRole>({
    orgaRoleString: '',
    orgaId: '',
    orgaFriendlyName: '',
    roleName: '',
    roleFriendlyName: ''
  });

  private roleFriendlyNameMapper: { [key: string]: string } = {
    OrgRep: 'Repräsentant',
    OrgLegRep: 'Prokurist',
  };

  constructor(
    private keycloakService: KeycloakService,
    private http: HttpClient,
    private httpBackend: HttpBackend
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
    let orgaId: string = role_arr.slice(1).join('_'); // everything else is the organization ID (which may include underscores again)
    return {
      orgaRoleString: orgaRoleString,
      roleName: roleName,
      roleFriendlyName: this.roleFriendlyNameMapper[roleName],
      orgaId: orgaId,
      orgaFriendlyName: 'Organisation ' + orgaId, // this is properly fetched once the organizationsApiService is loaded
    };
  }

  public changeActiveOrgaRole(orgaRoleString: string) {
    this.activeOrganizationRole.next(this.organizationRoles[orgaRoleString]);
  }

  private buildOrganizationRoles(userRoles: string[]) {
    for (let r of userRoles) {
      if (r.startsWith('OrgRep_') || r.startsWith('OrgLegRep_')) {
        this.organizationRoles[r] = this.getOrganizationRole(r);
        // if the active Role is not set, set its initial value to the first role we see
        if (this.activeOrganizationRole.getValue().orgaRoleString === '') {
          this.activeOrganizationRole.next(this.organizationRoles[r]);
        }
      }
    }
  }
}
