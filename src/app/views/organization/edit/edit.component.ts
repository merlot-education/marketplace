import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ILegalRegistrationNumberCs, IOrganizationData } from "../organization-data";
import { AuthService } from 'src/app/services/auth.service';
import { ActiveOrganizationRoleService } from 'src/app/services/active-organization-role.service';
import { OrganizationsApiService } from 'src/app/services/organizations-api.service';
import { ActivatedRoute } from '@angular/router';
import { OrganisationWizardExtensionComponent } from 'src/app/wizard-extension/organisation-wizard-extension/organisation-wizard-extension.component';
import { SdDownloadService } from 'src/app/services/sd-download.service';

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
    protected sdDownloadService: SdDownloadService,
    private route: ActivatedRoute) {
  }
  ngAfterViewInit(): void {
    let selectedOrgaId = this.route.snapshot.paramMap.get('orgaId');
    if (selectedOrgaId) {
      this.selectOrganization(selectedOrgaId);
    } else {
      this.activeOrgRoleService.activeOrganizationRole.subscribe(orga => {
        if (orga.orgaData.selfDescription.id 
          != this.selectedOrganization?.selfDescription.id) {
            this.selectOrganization(orga.orgaData.selfDescription.id);
        }
      });
    }
    this.wizardExtensionComponent.submitCompleteEvent.subscribe(_ => {
      this.authService.refreshActiveRoleOrgaData();
      this.refreshSelectedOrganization(this.selectedOrganization.selfDescription.id)
    });
  }

  ngOnInit(): void {
  }

  toogleJsonView() {
    this.jsonViewHidden = !this.jsonViewHidden;
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
        this.selectedOrganization.selfDescription.id).then(_ => {
          this.wizardExtensionComponent.prefillOrganisation(result);
        });
    });
  }

  private patchRegistrationNumberField(registrationNumberType: string, registrationNumberField: ILegalRegistrationNumberCs ) {
    if (!registrationNumberField[registrationNumberType]) { // if it does not exist, add dummy values
      registrationNumberField[registrationNumberType] = {'@value': "", '.type': "" }
    } 
    registrationNumberField[registrationNumberType]['disabled'] = !this.activeOrgRoleService.isActiveAsFedAdmin();
  }
}
