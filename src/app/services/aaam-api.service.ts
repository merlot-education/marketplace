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

  private patchOrgaId(id: string) : string {
    return id.replace("#", "%23");  // encode hashtag
  }

  public async getUsersFromOrganization(organizationId: string) {
    return [];
  }
}
