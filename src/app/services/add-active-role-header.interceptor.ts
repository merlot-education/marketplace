import { Injectable} from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { ActiveOrganizationRoleService } from './active-organization-role.service';

@Injectable()
export class AddActiveRoleHeaderInterceptor implements HttpInterceptor {

  constructor(private activeOrgaRoleService: ActiveOrganizationRoleService) {
}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let activeRole = this.activeOrgaRoleService.activeOrganizationRole.value;
    if (activeRole?.orgaRoleString) {
      const clonedRequest = req.clone(
        { 
          headers: req.headers.append('Active-Role', activeRole.orgaRoleString)
            .append('Authorization', 'Bearer ' + this.activeOrgaRoleService.accessToken)
        });
      // Pass the cloned request instead of the original request to the next handle
      return next.handle(clonedRequest);
    }
    return next.handle(req);
  }
}
