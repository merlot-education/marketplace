import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { OrganizationRole } from './auth.service'

@Injectable({
  providedIn: 'root',
})
export class ActiveOrganizationRoleService {
  public activeOrganizationRole: BehaviorSubject<OrganizationRole> =
  new BehaviorSubject<OrganizationRole>({
    orgaRoleString: '',
    roleName: '',
    roleFriendlyName: '',
  });

  public nextMethod(next: OrganizationRole){
    this.activeOrganizationRole.next(next)
  }
}