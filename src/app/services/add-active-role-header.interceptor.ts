import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AddActiveRoleHeaderInterceptor implements HttpInterceptor {

  constructor() {
    // TODO add auth service once it no longer breaks...
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    //const authService = this.injector.get(AuthService);
    /*if (this.authService.isLoggedIn) {
      // Clone the request to add the new header
      const clonedRequest = req.clone(
        { 
          headers: req.headers.append('Active-Role', this.authService.activeOrganizationRole.value.orgaRoleString)
        });
      // Pass the cloned request instead of the original request to the next handle
      return next.handle(clonedRequest);
    }*/
    return next.handle(req);
  }
}
