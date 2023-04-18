import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { lastValueFrom } from 'rxjs';
import { IUserData } from './views/users/user-data';

@Injectable({
  providedIn: 'root'
})
export class AaamApiService {

  constructor(    
    private http: HttpClient,
    protected authService: AuthService,
    ) { 
  }

  public async getUsersFromOrganization(organizationId: String) {
    // TODO input sanetization
    if (this.authService.isLoggedIn) {
      return await lastValueFrom(this.http.get("http://localhost:8081/api/users/fromOrganization/" + organizationId)) as IUserData[];
    } else {
      console.log("Error: Not logged in.");
      return []
    }
    
  }
}
