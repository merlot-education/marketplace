import { ActiveOrganizationRoleService } from './services/active-organization-role.service';
import { inject } from '@angular/core';

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