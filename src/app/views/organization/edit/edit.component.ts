import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { IOrganizationData, IRegistrationNumber } from "../organization-data";
import { AuthService } from 'src/app/services/auth.service';
import { ActiveOrganizationRoleService } from 'src/app/services/active-organization-role.service';
import { OrganizationsApiService } from 'src/app/services/organizations-api.service';
import { ActivatedRoute } from '@angular/router';
import { WizardExtensionComponent } from 'src/app/wizard-extension/wizard-extension.component';

@Component({
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit, AfterViewInit {

  protected selectedOrganization: IOrganizationData = undefined;

  @ViewChild("wizardExtension") private wizardExtensionComponent: WizardExtensionComponent;

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
        this.selectOrganization(orga.orgaData.selfDescription.verifiableCredential.credentialSubject['@id']);
      });
      this.wizardExtensionComponent.submitCompleteEvent.subscribe(_ => {
        this.authService.refreshActiveRoleOrgaData();
      });
    }
  }

  ngOnInit(): void {
  }

  private selectOrganization(orgaId: string) {
    this.selectedOrganization = undefined;
    console.log("get orga by id", orgaId);
    this.organizationsApiService.getOrgaById(orgaId).then(result => {
      console.log(result);
      result.selfDescription.verifiableCredential.credentialSubject['merlot:merlotId']['disabled'] = true;
      result.selfDescription.verifiableCredential.credentialSubject['gax-trust-framework:legalName']['disabled'] = !this.activeOrgRoleService.isActiveAsFedAdmin();
      result.selfDescription.verifiableCredential.credentialSubject['merlot:orgaName']['disabled'] = !this.activeOrgRoleService.isActiveAsFedAdmin();
      let registrationNumberFields = result.selfDescription.verifiableCredential.credentialSubject['gax-trust-framework:registrationNumber'];
      this.patchRegistrationNumberField('gax-trust-framework:local', registrationNumberFields);
      this.patchRegistrationNumberField('gax-trust-framework:EUID', registrationNumberFields);
      this.patchRegistrationNumberField('gax-trust-framework:EORI', registrationNumberFields);
      this.patchRegistrationNumberField('gax-trust-framework:vatID', registrationNumberFields);
      this.patchRegistrationNumberField('gax-trust-framework:leiCode', registrationNumberFields);

      this.selectedOrganization = result;
      if (!this.wizardExtensionComponent.isShapeLoaded()) {
        this.wizardExtensionComponent.loadShape("MerlotOrganization", 
        this.selectedOrganization.selfDescription.verifiableCredential.credentialSubject["@id"]).then(_ => {
          this.wizardExtensionComponent.prefillFields(result.selfDescription.verifiableCredential.credentialSubject);
        });
      } else {
        this.wizardExtensionComponent.prefillFields(result.selfDescription.verifiableCredential.credentialSubject);
      }
    });
  }

  private patchRegistrationNumberField(registrationNumberType: string, registrationNumberField: IRegistrationNumber) {
    if (!registrationNumberField[registrationNumberType]) { // if it does not exist, add dummy values
      registrationNumberField[registrationNumberType] = {'@value': "", '@type': "" }
    } 
    registrationNumberField[registrationNumberType]['disabled'] = !this.activeOrgRoleService.isActiveAsFedAdmin();
  }
}
