import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { OrganizationData } from './views/organization/organization-data';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class OrganizationsApiService {

  constructor(    
    private http: HttpClient,
    private authService: AuthService,
    ) { 
      this.getOrganizations().then(result => console.log(result));
    }

    public async getOrganizations() {
      let orgaData = await lastValueFrom(this.http.get("http://localhost:8082/api/organizations")) as OrganizationData[];
      let userOrgaIds = [];
      for (let orga in this.authService.organizationRoles) {
        userOrgaIds.push(this.authService.organizationRoles[orga]["companyId"])
      }
      console.log(userOrgaIds);

      for (let orga of orgaData) {
        orga.activeRepresentant = false;
        orga.passiveRepresentant = userOrgaIds.includes(orga.merlotId);
      }
      console.log(orgaData);
      return orgaData;


    }
}
