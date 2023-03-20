import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { visitorUser, dDueseUser, IUserAuth } from './views/users/user-data';


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
