import { Component, OnInit } from '@angular/core';
import { IOrganizationData } from "../organization-data";
import { AuthService } from 'src/app/services/auth.service';
import { OrganizationsApiService } from 'src/app/services/organizations-api.service';

@Component({
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit {

  protected selectedOrganization: IOrganizationData = null;

  constructor(protected authService: AuthService, 
    protected organizationsApiService: OrganizationsApiService) {
    authService.activeOrganizationRole.subscribe(orga => {
      this.selectedOrganization = null;
      organizationsApiService.getOrgaById(orga.orgaData.selfDescription.verifiableCredential.credentialSubject['@id']).then(result => {
        this.selectedOrganization = result;
      })
    })
  }

  ngOnInit(): void {
  }

  saveOrganisationEdit(orga: IOrganizationData) {
    orga.selfDescription.verifiableCredential.credentialSubject['gax-trust-framework:headquarterAddress'] = orga.selfDescription.verifiableCredential.credentialSubject['gax-trust-framework:legalAddress'];
    console.log(orga);
  }
}
