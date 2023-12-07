import { AuthService } from './services/auth.service';
import { inject } from '@angular/core';

export const fedAuthGuard = () => {
    const authService = inject(AuthService);
    // If the user's current role is not federator admin, deny access.
    return authService.isActiveAsFederatorAdmin;
};

export const repAuthGuard = () => {
    const authService = inject(AuthService);
    // If the user's current role is not representative, deny access.
    return authService.isActiveAsRepresentative;
};