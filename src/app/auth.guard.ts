import { AuthService } from './services/auth.service';
import {inject} from '@angular/core';

export const authGuard = () => {
    const authService = inject(AuthService);
    // If the user's current role is not federator admin, deny access.
    return authService.isActiveAsFederatorAdmin;
  };