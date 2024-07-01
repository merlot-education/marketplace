import { OidcSecurityService } from 'angular-auth-oidc-client';
import { ActiveOrganizationRoleService } from './services/active-organization-role.service';
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateChildFn, Router, RouterStateSnapshot } from '@angular/router';
import { map, take } from 'rxjs';

export const fedAuthGuard = () => {
    const activeOrgRoleService = inject(ActiveOrganizationRoleService);
    // If the user's current role is not federator admin, deny access.
    return activeOrgRoleService.isActiveAsFedAdmin();
};

export const fedOrgaEditAuthGuard: CanActivateChildFn = (
  next: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const activeOrgRoleService = inject(ActiveOrganizationRoleService);
  // Ensure that the current role is FedAdmin and the user is not trying to edit its own organization.
  return activeOrgRoleService.isActiveAsFedAdmin() && (next.params.orgaId !== activeOrgRoleService.getActiveOrgaId());
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