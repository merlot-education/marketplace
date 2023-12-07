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

  public isLoggedIn: boolean = false;
  public isActiveAsFederatorAdmin = false;
  public isActiveAsRepresentative = false;
  public userProfile: KeycloakProfile = {};
  public organizationRoles: {
    [orgaRoleKey: string]: OrganizationRole;
  } = {};

  public finishedLoadingRoles = false;

private getActiveOrganizationRole(): BehaviorSubject<OrganizationRole>{
 return this.activeOrganizationRoleService.activeOrganizationRole;
}

  private roleFriendlyNameMapper: { [key: string]: string } = {
    OrgLegRep: 'Prokurist',
    FedAdmin: 'Föderator',
  };

  constructor(
    private keycloakService: KeycloakService,
    private organizationApiService: OrganizationsApiService,
    private activeOrganizationRoleService: ActiveOrganizationRoleService
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
        this.getActiveOrganizationRole().value.orgaData.selfDescription
          .verifiableCredential.credentialSubject['@id']
      )
      .then((result) => {
        this.organizationRoles[
          this.getActiveOrganizationRole().value.orgaRoleString
        ].orgaData = result;
        this.changeActiveOrgaRole(
          this.getActiveOrganizationRole().value.orgaRoleString
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

  private isFederatorAdmin(roleName: string): boolean{
    return roleName === "FedAdmin";
  }

  private isRepresentative(roleName: string): boolean{
    return roleName === "OrgLegRep";
  }

  public getActiveOrgaId(): string {
    return this.getActiveOrganizationRole().value.orgaData?.selfDescription
      .verifiableCredential.credentialSubject['@id'];
  }

  public getActiveOrgaName(): string {
    return this.getActiveOrganizationRole().value.orgaData?.selfDescription
      .verifiableCredential.credentialSubject['merlot:orgaName']['@value'];
  }

  public getActiveOrgaLegalName(): string {
    return this.getActiveOrganizationRole().value.orgaData?.selfDescription
      .verifiableCredential.credentialSubject['gax-trust-framework:legalName'][
      '@value'
    ];
  }

  public changeActiveOrgaRole(orgaRoleString: string) {
    this.getActiveOrganizationRole().next(this.organizationRoles[orgaRoleString]);
    this.isActiveAsFederatorAdmin = this.isFederatorAdmin(this.getActiveOrganizationRole().value.roleName);
    this.isActiveAsRepresentative = this.isRepresentative(this.getActiveOrganizationRole().value.roleName);
  }

  private buildOrganizationRoles(userRoles: string[]) {
    for (let r of userRoles) {
      if (r.startsWith('OrgLegRep_') || r.startsWith('FedAdmin_')) {
        this.organizationRoles[r] = this.getOrganizationRole(r);
        // if the active Role is not set, set its initial value to the first role we see
        if (this.getActiveOrganizationRole().getValue().orgaRoleString === '') {
          this.getActiveOrganizationRole().next(this.organizationRoles[r]);
          this.isActiveAsFederatorAdmin = this.isFederatorAdmin(this.getActiveOrganizationRole().value.roleName);
          this.isActiveAsRepresentative = this.isRepresentative(this.getActiveOrganizationRole().value.roleName);
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
