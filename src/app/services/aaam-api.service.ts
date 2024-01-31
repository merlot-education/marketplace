import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActiveOrganizationRoleService } from './active-organization-role.service';
import { lastValueFrom } from 'rxjs';
import { IUserData } from '../views/users/user-data';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AaamApiService {

  constructor(    
    private http: HttpClient,
    protected activeOrgRoleService: ActiveOrganizationRoleService,
    ) { 
  }

  public async getUsersFromOrganization(organizationId: String) {
    if (this.activeOrgRoleService.isLoggedIn) {
      return await lastValueFrom(this.http.get(environment.aaam_api_url + "fromOrganization/" + organizationId)) as IUserData[];
    } else {
      console.log("Error: Not logged in.");
      return []
    }
    
  }
}
