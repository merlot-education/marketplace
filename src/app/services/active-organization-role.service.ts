/*
 *  Copyright 2024 Dataport. All rights reserved. Developed as part of the MERLOT project.
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
import { BehaviorSubject } from 'rxjs';
import { OrganizationRole } from './auth.service'
import { getOrganizationLegalName, getOrganizationName } from '../utils/credential-tools';

@Injectable({
  providedIn: 'root',
})
export class ActiveOrganizationRoleService {
  public isLoggedIn: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public userData?: any = null;

  public firstName?: string = null;
  public lastName?: string = null; 

  public accessToken: string = null;

  public organizationRoles: {
    [orgaRoleKey: string]: OrganizationRole;
  } = {};

  public activeOrganizationRole: BehaviorSubject<OrganizationRole> =
    new BehaviorSubject<OrganizationRole>({
      orgaId: '',
      orgaRoleString: '',
      roleName: '',
      roleFriendlyName: '',
    });

  public getActiveOrgaId(): string {
    return this.activeOrganizationRole.value.orgaId;
  }

  public getActiveOrgaName(): string {
    return getOrganizationName(this.activeOrganizationRole.value.orgaData?.selfDescription);
  }

  public getActiveOrgaLegalName(): string {
    return getOrganizationLegalName(this.activeOrganizationRole.value.orgaData?.selfDescription);
  }

  public changeActiveOrgaRole(orgaRoleString: string) {
    this.activeOrganizationRole.next(this.organizationRoles[orgaRoleString]);
  }

  public addOrganizationRoles(userRoles: string[]) {
    for (let r of userRoles) {
      if (r.startsWith('OrgLegRep_') || r.startsWith('FedAdmin_')) {
        this.organizationRoles[r] = this.getOrganizationRole(r);
        // if the active Role is not set, set its initial value to the first role we see
        if (this.activeOrganizationRole.getValue().orgaRoleString === '') {
          this.activeOrganizationRole.next(this.organizationRoles[r]);
        }
      }
    }
    console.log(this.organizationRoles);
  }

  private roleFriendlyNameMapper: { [key: string]: string } = {
    OrgLegRep: 'Prokurist',
    FedAdmin: 'Föderationsadmin',
  };

  private getOrganizationRole(orgaRoleString: string): OrganizationRole {
    let role_arr: string[] = orgaRoleString.split('_');
    let roleName: string = role_arr[0]; // first part is the role name
    return {
      orgaId: orgaRoleString.replace(roleName + "_", ""),
      orgaRoleString: orgaRoleString,
      roleName: roleName,
      roleFriendlyName: this.roleFriendlyNameMapper[roleName],
    };
  }

  public isActiveAsFedAdmin(): boolean {
    return this.activeOrganizationRole.value.roleName === "FedAdmin";
  }

  public isActiveAsRepresentative(): boolean {
    return this.activeOrganizationRole.value.roleName === "OrgLegRep";
  }
}