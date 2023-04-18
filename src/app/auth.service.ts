import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { HttpBackend } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  //public user = new BehaviorSubject<{friendlyRoleName: string, roles: string[]}>({friendlyRoleName: "Visitor", roles: ["visitor", "user", "principal", "admin"]});

  private token: string = "";

  public isLoggedIn: boolean = false;
  public userProfile: KeycloakProfile = {};
  public userRoles: string[] = [];
  /*public organizationRoles: {
    role: string,
    roleData: {
      roleName: string,
      roleFriendlyName: string, 
      companyId: string, 
      companyFriendlyName: string
    }
  }[] = [];*/
  public organizationRoles: {[key: string]: {
    roleName: string,
    roleFriendlyName: string, 
    companyId: string, 
    companyFriendlyName: string
  }} = {};


  public activeOrganizationRole: BehaviorSubject<string> = new BehaviorSubject<string>("");

  private roleFriendlyNameMapper: {[key: string]: string} = {
    "OrgRep": "Repräsentant", 
    "OrgLegRep": "Prokurist"
  };

  // TODO this needs to be replaced by the organization orchestrator data
  private companyIdMapper: {[key: string]: string} = {
    "1": "Dataport",
    "2": "Schülerkarriere"
  };

  constructor(
    private keycloakService: KeycloakService,
    private http: HttpClient,
    private httpBackend: HttpBackend
  ) {
    //this.http = new HttpClient(httpBackend);  // this is for testing in order to skip the HTTPInterceptor of the keycloak library
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
        this.organizationRoles[r] = {
            roleName: role_arr[0],
            roleFriendlyName: this.roleFriendlyNameMapper[role_arr[0]], 
            companyId: role_arr[1],
            companyFriendlyName: this.companyIdMapper[role_arr[1]],
        };
        if (this.activeOrganizationRole.getValue() === "") {
          this.activeOrganizationRole.next(r);
        }  
      }
    }

  }
}
