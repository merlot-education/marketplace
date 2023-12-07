import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { OrganizationRole } from './auth.service'

@Injectable({
  providedIn: 'root',
})
export class ActiveOrganizationRoleService {
  public isLoggedIn: boolean = false;

  public organizationRoles: {
    [orgaRoleKey: string]: OrganizationRole;
  } = {};

  public activeOrganizationRole: BehaviorSubject<OrganizationRole> =
    new BehaviorSubject<OrganizationRole>({
      orgaRoleString: '',
      roleName: '',
      roleFriendlyName: '',
    });

  public getActiveOrgaId(): string {
    return this.activeOrganizationRole.value.orgaData?.selfDescription
      .verifiableCredential.credentialSubject['@id'];
  }

  public getActiveOrgaName(): string {
    return this.activeOrganizationRole.value.orgaData?.selfDescription
      .verifiableCredential.credentialSubject['merlot:orgaName']['@value'];
  }

  public getActiveOrgaLegalName(): string {
    return this.activeOrganizationRole.value.orgaData?.selfDescription
      .verifiableCredential.credentialSubject['gax-trust-framework:legalName'][
      '@value'
    ];
  }

  public changeActiveOrgaRole(orgaRoleString: string) {
    this.activeOrganizationRole.next(this.organizationRoles[orgaRoleString]);
  }

  public addOrganizationRoles(userRoles: string[]) {
    for (let r of userRoles) {
      if (r.startsWith('OrgLegRep_') || r.startsWith('FedAdmin_')) {
        this.organizationRoles[r] = this.getOrganizationRole(r);
        // if the active Role is not set, set its initial value to the first role we see
        if (this.activeOrganizationRole.getValue().orgaRoleString === '') {
          this.activeOrganizationRole.next(this.organizationRoles[r]);
        }
      }
    }
  }

  private roleFriendlyNameMapper: { [key: string]: string } = {
    OrgLegRep: 'Prokurist',
    FedAdmin: 'Föderator',
  };

  private getOrganizationRole(orgaRoleString: string): OrganizationRole {
    let role_arr: string[] = orgaRoleString.split('_');
    let roleName: string = role_arr[0]; // first part is the role name
    return {
      orgaRoleString: orgaRoleString,
      roleName: roleName,
      roleFriendlyName: this.roleFriendlyNameMapper[roleName],
    };
  }

  public isActiveAsFedAdmin(): boolean {
    return this.activeOrganizationRole.value.roleName == "FedAdmin";
  }

  public isActiveAsRepresentative(): boolean {
    return this.activeOrganizationRole.value.roleName == "OrgLegRep";
  }
}