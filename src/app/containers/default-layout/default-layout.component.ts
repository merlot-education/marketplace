import { Component } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { AuthService, OrganizationRole } from 'src/app/services/auth.service';
import { ActiveOrganizationRoleService } from 'src/app/services/active-organization-role.service';

import {
  IRoleNavData,
  OrganizationRoleLayoutData,
} from '@merlot-education/m-dashboard-ui';
import { navItems } from './_nav';

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html',
})
export class DefaultLayoutComponent {
  public navItems: IRoleNavData[];

  public selectedRoleOption: string = '';

  wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  objectKeys = Object.keys;

  organizationRolesForLayout: OrganizationRoleLayoutData[] = [];

  public perfectScrollbarConfig = {
    suppressScrollX: true,
  };

  constructor(
    protected authService: AuthService,
    protected activeOrgRoleService: ActiveOrganizationRoleService,
    protected keycloakService: KeycloakService
  ) {
    let globalNavItems = structuredClone(navItems);
    this.navItems = this.buildAllowedNavItems(globalNavItems, null);
  }

  public async ngOnInit() {
    this.selectedRoleOption =
      this.activeOrgRoleService.activeOrganizationRole.getValue().orgaRoleString;

    let tries = 0;
    while (this.activeOrgRoleService.isLoggedIn) {
      console.log('waiting for roles to load');
      await this.wait(100);

      if (this.authService.finishedLoadingRoles) {
        this.activeOrgRoleService.activeOrganizationRole.subscribe(role => {
          let globalNavItems = structuredClone(navItems);
          this.navItems = this.buildAllowedNavItems(globalNavItems, role);
        });
        this.loadRolesForMenu();
        break;
      }

      // TODO: remove this if there are no regular problems with roles (don't forget the tries variable above)
      tries++;
      if (tries > 10) {
        console.warn(
          'still trying to load roles from the auth service, if you keep seeing this warning, check in `buildOrganizationRoles`'
        );
      }
    }
  }

  private loadRolesForMenu() {
    for (let role in this.activeOrgRoleService.organizationRoles) {
      this.organizationRolesForLayout.push({
        orgaRoleString: this.activeOrgRoleService.organizationRoles[role].orgaRoleString,
        roleName: this.activeOrgRoleService.organizationRoles[role].roleName,
        roleFriendlyName:
          this.activeOrgRoleService.organizationRoles[role].roleFriendlyName,
        orgaName:
          this.activeOrgRoleService.organizationRoles[role].orgaData?.selfDescription
            .verifiableCredential.credentialSubject['merlot:orgaName'][
            '@value'
          ],
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
