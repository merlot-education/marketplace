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

  public finishedLoadingRoles = false;

  public activeOrganizationRole: BehaviorSubject<OrganizationRole> =
    new BehaviorSubject<OrganizationRole>({
      orgaRoleString: '',
      roleName: '',
      roleFriendlyName: '',
    });

  private roleFriendlyNameMapper: { [key: string]: string } = {
    OrgLegRep: 'Prokurist',
    FedAdmin: 'Föderator',
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

  public refreshActiveRoleOrgaData() {
    this.organizationApiService
      .getOrgaById(
        this.activeOrganizationRole.value.orgaData.selfDescription
          .verifiableCredential.credentialSubject['@id']
      )
      .then((result) => {
        this.organizationRoles[
          this.activeOrganizationRole.value.orgaRoleString
        ].orgaData = result;
        this.changeActiveOrgaRole(
          this.activeOrganizationRole.value.orgaRoleString
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

  private getOrganizationRole(orgaRoleString: string): OrganizationRole {
    let role_arr: string[] = orgaRoleString.split('_');
    let roleName: string = role_arr[0]; // first part is the role name
    return {
      orgaRoleString: orgaRoleString,
      roleName: roleName,
      roleFriendlyName: this.roleFriendlyNameMapper[roleName],
    };
  }

  public getActiveOrgaId(): string {
    return this.activeOrganizationRole.value.orgaData?.selfDescription
      .verifiableCredential.credentialSubject['@id'];
  }

  public getActiveOrgaName(): string {
    return this.activeOrganizationRole.value.orgaData?.selfDescription
      .verifiableCredential.credentialSubject['merlot:orgaName']['@value'];
  }

  public getActiveOrgaLegalName(): string {
    return this.activeOrganizationRole.value.orgaData?.selfDescription
      .verifiableCredential.credentialSubject['gax-trust-framework:legalName'][
      '@value'
    ];
  }

  public changeActiveOrgaRole(orgaRoleString: string) {
    this.activeOrganizationRole.next(this.organizationRoles[orgaRoleString]);
  }

  private buildOrganizationRoles(userRoles: string[]) {
    for (let r of userRoles) {
      if (r.startsWith('OrgLegRep_') || r.startsWith('FedAdmin_')) {
        this.organizationRoles[r] = this.getOrganizationRole(r);
        // if the active Role is not set, set its initial value to the first role we see
        if (this.activeOrganizationRole.getValue().orgaRoleString === '') {
          this.activeOrganizationRole.next(this.organizationRoles[r]);
        }
      }
    }

    let numOfOrgsToLoad = Object.keys(this.organizationRoles).length;

    // update organization data after building the list
    for (let orgaRoleKey in this.organizationRoles) {
      // try finding the organization of this role
      let orgaId: string = orgaRoleKey.split('_').slice(1).join('_'); // everything after the first part is the organization ID (which may include underscores again)
      this.organizationApiService.getOrgaById(orgaId).then((orga) => {
        this.organizationRoles[orgaRoleKey].orgaData = orga;

        numOfOrgsToLoad--;

        if (numOfOrgsToLoad == 0) {
          this.finishedLoadingRoles = true;
        }
      });
    }
  }
}
