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

import { Component } from '@angular/core';
import { AuthService, OrganizationRole } from 'src/app/services/auth.service';
import { ActiveOrganizationRoleService } from 'src/app/services/active-organization-role.service';

import {
  IRoleNavData,
  OrganizationRoleLayoutData,
} from '@merlot-education/m-dashboard-ui';
import { navItems } from './_nav';
import packageJson from '../../../../package.json';
import { getOrganizationName } from 'src/app/utils/credential-tools';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.scss']
})
export class DefaultLayoutComponent {
  public navItems: IRoleNavData[];

  public selectedRoleOption: string = '';
  protected version: string = packageJson.version;

  protected environment = environment;

  wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  objectKeys = Object.keys;

  organizationRolesForLayout: OrganizationRoleLayoutData[] = [];

  public perfectScrollbarConfig = {
    suppressScrollX: true,
  };

  constructor(
    protected authService: AuthService,
    protected activeOrgRoleService: ActiveOrganizationRoleService
  ) {}

  public async ngOnInit() {
    let globalNavItems = structuredClone(navItems);
    this.navItems = this.buildAllowedNavItems(globalNavItems, null);
    this.authService.finishedLoadingRoles.subscribe(finished => {
      if (finished) {
        this.selectedRoleOption = this.activeOrgRoleService.activeOrganizationRole.getValue().orgaRoleString;
        this.activeOrgRoleService.activeOrganizationRole.subscribe(role => {
          let globalNavItems = structuredClone(navItems);
          this.navItems = this.buildAllowedNavItems(globalNavItems, role);
        });
        this.loadRolesForMenu();
      }
    });
  }

  private loadRolesForMenu() {
    for (let role in this.activeOrgRoleService.organizationRoles) {
      this.organizationRolesForLayout.push({
        orgaRoleString: this.activeOrgRoleService.organizationRoles[role].orgaRoleString,
        roleName: this.activeOrgRoleService.organizationRoles[role].roleName,
        roleFriendlyName:
          this.activeOrgRoleService.organizationRoles[role].roleFriendlyName,
        orgaName: getOrganizationName(this.activeOrgRoleService.organizationRoles[role].orgaData?.selfDescription)
      });
    }
  }

  private buildAllowedNavItems(navItems: IRoleNavData[], activeRole: OrganizationRole) {
    let outNavItems: IRoleNavData[] = [];
    // iterate over navItems, check if they are allowed for this role
    for (let navItem of navItems) {
      // check if entry itself is allowed
      if (!this.checkNavItemRoleAllowed(navItem, activeRole)) {
        // if not allowed, don't waste time with checking children
        continue;
      }

      // checking for children and their roles
      if (navItem.children !== undefined) {
        navItem.children = this.buildAllowedNavItems(navItem.children, activeRole);
      }

      // at this point we have an allowed item with allowed children, push it back to the list
      outNavItems.push(navItem);
    }
    return outNavItems;
  }

  private checkNavItemRoleAllowed(navItem: IRoleNavData, activeRole: OrganizationRole) {
    if (navItem.allowedRoles.includes("Visitor")) { // if visitor is included, everyone can see it
      return true;
    }
    if (!activeRole) { // make sure we have a proper role from this point onwards
      return false;
    }
    if (activeRole.roleName === "OrgLegRep") {
      return navItem.allowedRoles.includes("Rep");
    }
    if (activeRole.roleName === "FedAdmin") {
      return navItem.allowedRoles.includes("FedAdmin");
    }
    return false; // if nothing matches, deny
  }

  selectedRoleChanged(event: any) {
    this.selectedRoleOption = event.value;
    this.authService.changeActiveOrgaRole(this.selectedRoleOption);
  }
}
