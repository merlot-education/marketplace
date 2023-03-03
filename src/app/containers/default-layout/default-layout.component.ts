import { Component } from '@angular/core';
import { INavData } from '@coreui/angular';
import { AuthService } from 'src/app/auth.service';

import { IRoleNavData, navItems } from './_nav';

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html',
})
export class DefaultLayoutComponent {

  public navItems: IRoleNavData[]; 

  public perfectScrollbarConfig = {
    suppressScrollX: true,
  };

  constructor(
    protected authService: AuthService
  ) {
    let globalNavItems = structuredClone(navItems);
    this.navItems = this.buildAllowedNavItems(globalNavItems);
  }

  public ngOnInit(): void {
    this.authService.user.subscribe(x => {
      let globalNavItems = structuredClone(navItems);
      this.navItems = this.buildAllowedNavItems(globalNavItems)
    });
  }

  private buildAllowedNavItems(navItems: IRoleNavData[]) {
    let outNavItems : IRoleNavData[] = []
    // iterate over navItems, check if they are allowed for this role
    for (let navItem of navItems) {
      // check if entry itself is allowed
      if (!this.checkNavItemRoleAllowed(navItem)) {
        // if not allowed, don't waste time with checking children
        continue;
      }
      
      // checking for children and their roles
      if (navItem.children !== undefined) {
        navItem.children = this.buildAllowedNavItems(navItem.children);
      }

      // at this point we have an allowed item with allowed children, push it back to the list
      outNavItems.push(navItem)
    }
    return outNavItems;
  }

  private checkNavItemRoleAllowed(navItem: IRoleNavData) {
    // if no roles are defined, allow for everyone
    if (navItem.allowedRoles === undefined) {
      return true
    }
    // otherwise ask the auth service if the current user has any of the allowed roles
    return navItem.allowedRoles.some(r => this.authService.user.value.roles.includes(r));
  }


}
