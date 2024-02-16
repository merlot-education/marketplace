import { Injectable} from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { ActiveOrganizationRoleService } from './active-organization-role.service';
import { Stream } from 'stream';
import { environment } from 'src/environments/environment';

@Injectable()
export class AddActiveRoleHeaderInterceptor implements HttpInterceptor {

  constructor(private activeOrgaRoleService: ActiveOrganizationRoleService) {
}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let activeRole = this.activeOrgaRoleService.activeOrganizationRole.value;
    let matchUrl = false;
    for (let url of [environment.aaam_api_url, environment.organizations_api_url, 
                      environment.serviceoffering_api_url, environment.contract_api_url, 
                      environment.wizard_api_url]) {
      matchUrl ||= req.url.startsWith(url);
    }
    if (activeRole?.orgaRoleString && matchUrl) {
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
