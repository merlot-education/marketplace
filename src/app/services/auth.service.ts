/*
 *  Copyright 2023-2024 Dataport AöR
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { Injectable } from '@angular/core';
import { OrganizationsApiService } from './organizations-api.service';
import { ActiveOrganizationRoleService } from './active-organization-role.service';
import { IOrganizationData } from '../views/organization/organization-data';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { BehaviorSubject } from 'rxjs';
import { jwtDecode }from 'jwt-decode';
import { getParticipantIdFromParticipantSd } from '../utils/credential-tools';

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
        let roles = []
        if ('Role' in this.activeOrgRoleService.userData && 'issuerDID' in this.activeOrgRoleService.userData) {
          // login from ssi
          roles = [(this.activeOrgRoleService.userData.Role + "_" + this.activeOrgRoleService.userData.issuerDID)];
          this.activeOrgRoleService.firstName = this.activeOrgRoleService.userData.Vorname;
          this.activeOrgRoleService.lastName = this.activeOrgRoleService.userData.Nachname;
        } else {
          // login from keycloak
          let token: any = jwtDecode(this.activeOrgRoleService.accessToken);
          roles = token.realm_access.roles;
          this.activeOrgRoleService.firstName = this.activeOrgRoleService.userData.given_name;
          this.activeOrgRoleService.lastName = this.activeOrgRoleService.userData.family_name;
        }
        this.buildOrganizationRoles(roles);
      }
    });
  }

  public refreshActiveRoleOrgaData() {
    this.organizationApiService
      .getOrgaById(
        getParticipantIdFromParticipantSd(this.activeOrgRoleService.activeOrganizationRole.value.orgaData.selfDescription)
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
      }).catch(e => {
        console.log("failed to fetch organisation.", e);
        this.finishedLoadingRoles.next(true);
      });
    }
  }
}
