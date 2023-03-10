import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface IUserAuth {
  username: string,
  userFirstName?: string,
  userLastName?: string,
  companyRoles: ICompanyRole[] 
  loggedIn: boolean
}

interface IRole {
  id: number,
  roleName: string,
  roleLongName: string
}

interface ICompany {
  id: number,
  companyName: string,
  companyLongName: string
}

interface ICompanyRole {
  company?: ICompany,
  role: IRole
}

let visitorRole: IRole = {
  id: 0,
  roleName: "Visitor",
  roleLongName: "Visitor"
}

let orgLegRepRole: IRole = {
  id: 1,
  roleName: "OrgLegRep",
  roleLongName: "Organizational Legal Representative"
}

let gaiaXComp: ICompany =  {
  id: 0,
  companyName: "Gaia-X",
  companyLongName: "Gaia-X European Association for Data and Cloud AISBL"
}


let dataportComp: ICompany = {
  id: 1,
  companyName: "Dataport",
  companyLongName: "Dataport AöR"
}


let visitorUser: IUserAuth = {
  username: "Visitor",
  companyRoles: [
    {role: visitorRole}
  ],
  loggedIn: false
}

let dDueseUser: IUserAuth = {
  username: "DDüse",
  userFirstName: "Daniel",
  userLastName: "Düsentrieb",
  companyRoles: [
    {company: dataportComp, role: orgLegRepRole}
  ],
  loggedIn: true
}



@Injectable({
  providedIn: 'root'
})
export class AuthService {
  //public user = new BehaviorSubject<{friendlyRoleName: string, roles: string[]}>({friendlyRoleName: "Visitor", roles: ["visitor", "user", "principal", "admin"]});

  public user = new BehaviorSubject<IUserAuth>(visitorUser);


  constructor() { }

  visitor() {
    this.user.next(visitorUser);
  }

  logIn() {
    this.user.next(dDueseUser);
  }

  /*visitor() {
    this.user.next({friendlyRoleName: "Visitor", roles: ["visitor", "user", "principal", "admin"]});
    console.log("switched to visitor role");
  }

  portalUser() {
    this.user.next({friendlyRoleName: "User", roles: ["visitor", "user", "principal", "admin"]});
    console.log("switched to user role");
  }

  principal() {
    this.user.next({friendlyRoleName: "Principal", roles: ["visitor", "user", "principal", "admin"]});
    console.log("switched to principal role");
  }

  admin() {
    this.user.next({friendlyRoleName: "Admin", roles: ["visitor", "user", "principal", "admin"]});
    console.log("switched to admin role");
  }*/
}
