import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { visitorUser, dDueseUser, IUserAuth } from './views/users/user-data';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  //public user = new BehaviorSubject<{friendlyRoleName: string, roles: string[]}>({friendlyRoleName: "Visitor", roles: ["visitor", "user", "principal", "admin"]});

  private token: string = "";

  public user = new BehaviorSubject<IUserAuth>(visitorUser);
  public isLoggedIn: boolean = false;
  public userProfile: KeycloakProfile = {};
  public userRoles: string[] = [];
  public companyRoles: { roleName: string, companyId: string }[] = [];

  private roleFriendlyNameMapper: {[key: string]: string} = {
    "OrgRep": "Repräsentant", 
    "OrgLegRep": "Prokurist"
  };

  // TODO this needs to be replaced by the organization orchestrator data
  private companyIdMapper: {[key: string]: string} = {
    "1": "Dataport"
  };

  constructor(
    private keycloakService: KeycloakService
  ) {
    this.keycloakService.isLoggedIn().then(result => {
      this.isLoggedIn = result;
      if (this.isLoggedIn) {
        this.userRoles = this.keycloakService.getUserRoles();
        this.buildCompanyRoles(this.userRoles);
        this.keycloakService.loadUserProfile().then(result =>  {
          this.userProfile = result;
          console.log(this.isLoggedIn, this.userProfile, this.userRoles);
        });
        this.keycloakService.getToken().then(result => {
          this.token = result;
          console.log(this.token);
        })
      }
    });
   }

  logOut() {
    this.keycloakService.logout();
  }

  logIn() {
    this.keycloakService.login();
  }

  private buildCompanyRoles(userRoles: string[]) {
    for (let r of userRoles) {
      let role_arr = r.split("_");
      if (["OrgRep", "OrgLegRep"].includes(role_arr[0])) {
        // TODO we need to fetch the company name from the organization orchestrator for this id
        this.companyRoles.push({
          roleName: this.roleFriendlyNameMapper[role_arr[0]], 
          companyId: this.companyIdMapper[role_arr[1]]
        });  
      }
    }
  }
}
