import { OidcSecurityService } from 'angular-auth-oidc-client';
import { ActiveOrganizationRoleService } from './services/active-organization-role.service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { map, take } from 'rxjs';

export const fedAuthGuard = () => {
    const activeOrgRoleService = inject(ActiveOrganizationRoleService);
    // If the user's current role is not federator admin, deny access.
    return activeOrgRoleService.isActiveAsFedAdmin();
};

export const repAuthGuard = () => {
    const activeOrgRoleService = inject(ActiveOrganizationRoleService);
    // If the user's current role is not representative, deny access.
    return activeOrgRoleService.isActiveAsRepresentative();
};

export const isAuthenticated = () => {
    const oidcSecurityService = inject(OidcSecurityService);
    const router = inject(Router);
  
    return oidcSecurityService.isAuthenticated$.pipe(
      take(1),
      map(({ isAuthenticated }) => {
        if (!isAuthenticated) {
          router.navigate(['']);
  
          return false;
        }
        return true;
      })
    );
  };