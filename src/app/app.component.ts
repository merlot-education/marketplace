import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { IconSetService } from '@coreui/icons-angular';
import { iconSubset } from './icons/icon-subset';
import { Title } from '@angular/platform-browser';

import { OidcSecurityService } from 'angular-auth-oidc-client';
import { ActiveOrganizationRoleService } from './services/active-organization-role.service';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
})
export class AppComponent implements OnInit {
  title = 'MERLOT Portal';
  

  constructor(
    private router: Router,
    private titleService: Title,
    private iconSetService: IconSetService,
    private oidcSecurityService: OidcSecurityService,
    private activeOrgRoleService: ActiveOrganizationRoleService
  ) {
    titleService.setTitle(this.title);
    // iconSet singleton
    iconSetService.icons = { ...iconSubset };

    this.oidcSecurityService
      .checkAuth()
      .subscribe((loginResponse: any) => {
        console.log(loginResponse);
        const { isAuthenticated, userData, accessToken, idToken, configId } = loginResponse;
        activeOrgRoleService.userData = userData;
        activeOrgRoleService.accessToken = accessToken;

        // update this last to trigger next steps
        activeOrgRoleService.isLoggedIn.next(isAuthenticated);
      });
  }

  ngOnInit(): void {
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
    });
  }
}
