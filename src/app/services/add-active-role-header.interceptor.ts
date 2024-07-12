/*
 *  Copyright 2023-2024 Dataport AöR
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { Injectable} from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { ActiveOrganizationRoleService } from './active-organization-role.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class AddActiveRoleHeaderInterceptor implements HttpInterceptor {

  constructor(private activeOrgaRoleService: ActiveOrganizationRoleService) {
}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let activeRole = this.activeOrgaRoleService.activeOrganizationRole.value;
    let matchUrl = false;
    for (let url of [environment.organizations_api_url, 
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
