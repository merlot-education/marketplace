import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { IOrganizationData, IRegistrationNumber } from "../organization-data";
import { AuthService } from 'src/app/services/auth.service';
import { ActiveOrganizationRoleService } from 'src/app/services/active-organization-role.service';
import { OrganizationsApiService } from 'src/app/services/organizations-api.service';
import { ActivatedRoute } from '@angular/router';
import { OrganisationWizardExtensionComponent } from 'src/app/wizard-extension/organisation-wizard-extension/organisation-wizard-extension.component';
import { JsonPipe } from '@angular/common';

@Component({
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit, AfterViewInit {

  protected selectedOrganization: IOrganizationData = undefined;
  protected jsonViewHidden: boolean = true;

  @ViewChild("wizardExtension") private wizardExtensionComponent: OrganisationWizardExtensionComponent;

  constructor(protected authService: AuthService, 
    protected activeOrgRoleService: ActiveOrganizationRoleService,
    protected organizationsApiService: OrganizationsApiService, 
    private route: ActivatedRoute) {
  }
  ngAfterViewInit(): void {
    let selectedOrgaId = this.route.snapshot.paramMap.get('orgaId');
    if (selectedOrgaId) {
      this.selectOrganization(selectedOrgaId);
    } else {
      this.activeOrgRoleService.activeOrganizationRole.subscribe(orga => {
        if (orga.orgaData.selfDescription.verifiableCredential.credentialSubject['@id'] 
          != this.selectedOrganization?.selfDescription.verifiableCredential.credentialSubject['@id']) {
            this.selectOrganization(orga.orgaData.selfDescription.verifiableCredential.credentialSubject['@id']);
        }
      });
    }
    this.wizardExtensionComponent.submitCompleteEvent.subscribe(_ => {
      this.authService.refreshActiveRoleOrgaData();
      this.refreshSelectedOrganization(this.selectedOrganization.selfDescription.verifiableCredential.credentialSubject['@id'])
    });
  }

  ngOnInit(): void {
  }

  toogleJsonView() {
    this.jsonViewHidden = !this.jsonViewHidden;
  }

  downloadJsonFile() {
    // Convert the object to a JSON string
    const jsonData = JSON.stringify(this.selectedOrganization.selfDescription);

    // Create a Blob from the JSON string
    const blob = new Blob([jsonData], { type: 'application/json' });

    // Create a URL for the Blob
    const url = window.URL.createObjectURL(blob);

    // Create an anchor element with download attribute
    const a = document.createElement('a');
    a.href = url;
    const id = this.selectedOrganization.selfDescription.verifiableCredential.credentialSubject['@id'];
    a.download = 'selfdescription_' + id + '.json';

    // Programmatically click the anchor element to trigger the download
    document.body.appendChild(a);
    a.click();

    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  private refreshSelectedOrganization(orgaId: string) {
    this.organizationsApiService.getOrgaById(orgaId).then(result => {
      console.log(result);
      result.selfDescription.verifiableCredential.credentialSubject['gax-trust-framework:legalName']['disabled'] = !this.activeOrgRoleService.isActiveAsFedAdmin();
      result.selfDescription.verifiableCredential.credentialSubject['merlot:orgaName']['disabled'] = !this.activeOrgRoleService.isActiveAsFedAdmin();
      let registrationNumberFields = result.selfDescription.verifiableCredential.credentialSubject['gax-trust-framework:registrationNumber'];
      this.patchRegistrationNumberField('gax-trust-framework:local', registrationNumberFields);
      this.patchRegistrationNumberField('gax-trust-framework:EUID', registrationNumberFields);
      this.patchRegistrationNumberField('gax-trust-framework:EORI', registrationNumberFields);
      this.patchRegistrationNumberField('gax-trust-framework:vatID', registrationNumberFields);
      this.patchRegistrationNumberField('gax-trust-framework:leiCode', registrationNumberFields);

      this.selectedOrganization = result;
    });
  }

  private selectOrganization(orgaId: string) {
    this.selectedOrganization = undefined;
    console.log("get orga by id", orgaId);
    this.organizationsApiService.getOrgaById(orgaId).then(result => {
      console.log(result);
      result.selfDescription.verifiableCredential.credentialSubject['gax-trust-framework:legalName']['disabled'] = !this.activeOrgRoleService.isActiveAsFedAdmin();
      result.selfDescription.verifiableCredential.credentialSubject['merlot:orgaName']['disabled'] = !this.activeOrgRoleService.isActiveAsFedAdmin();
      let registrationNumberFields = result.selfDescription.verifiableCredential.credentialSubject['gax-trust-framework:registrationNumber'];
      this.patchRegistrationNumberField('gax-trust-framework:local', registrationNumberFields);
      this.patchRegistrationNumberField('gax-trust-framework:EUID', registrationNumberFields);
      this.patchRegistrationNumberField('gax-trust-framework:EORI', registrationNumberFields);
      this.patchRegistrationNumberField('gax-trust-framework:vatID', registrationNumberFields);
      this.patchRegistrationNumberField('gax-trust-framework:leiCode', registrationNumberFields);

      this.selectedOrganization = result;
      this.wizardExtensionComponent.loadShape(
        this.selectedOrganization.selfDescription.verifiableCredential.credentialSubject["@id"]).then(_ => {
          this.wizardExtensionComponent.prefillOrganisation(result);
        });
    });
  }

  private patchRegistrationNumberField(registrationNumberType: string, registrationNumberField: IRegistrationNumber) {
    if (!registrationNumberField[registrationNumberType]) { // if it does not exist, add dummy values
      registrationNumberField[registrationNumberType] = {'@value': "", '@type': "" }
    } 
    registrationNumberField[registrationNumberType]['disabled'] = !this.activeOrgRoleService.isActiveAsFedAdmin();
  }
}
