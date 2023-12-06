import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { IOrganizationData } from "../organization-data";
import { AuthService } from 'src/app/services/auth.service';
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
    protected organizationsApiService: OrganizationsApiService, 
    private route: ActivatedRoute) {
  }
  ngAfterViewInit(): void {
    let selectedOrgaId = this.route.snapshot.paramMap.get('orgaId');
    if (selectedOrgaId) {
      this.selectOrganization(selectedOrgaId);
    } else {
      this.authService.activeOrganizationRole.subscribe(orga => {
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

      result.selfDescription.verifiableCredential.credentialSubject['merlot:merlotId']['disabled'] = true;
      result.selfDescription.verifiableCredential.credentialSubject['gax-trust-framework:legalName']['disabled'] = true;
      result.selfDescription.verifiableCredential.credentialSubject['merlot:orgaName']['disabled'] = true;
      result.selfDescription.verifiableCredential.credentialSubject['gax-trust-framework:registrationNumber']['gax-trust-framework:local']['disabled'] = true;
      // TODO allow other types of registration number
      result.selfDescription.verifiableCredential.credentialSubject['gax-trust-framework:registrationNumber']['gax-trust-framework:EUID'] = {'@value': "", '@type': "", 'disabled': true};
      result.selfDescription.verifiableCredential.credentialSubject['gax-trust-framework:registrationNumber']['gax-trust-framework:EORI'] = {'@value': "", '@type': "", 'disabled': true};
      result.selfDescription.verifiableCredential.credentialSubject['gax-trust-framework:registrationNumber']['gax-trust-framework:vatID'] = {'@value': "", '@type': "", 'disabled': true};
      result.selfDescription.verifiableCredential.credentialSubject['gax-trust-framework:registrationNumber']['gax-trust-framework:leiCode'] = {'@value': "", '@type': "", 'disabled': true};
      console.log(result);

      this.selectedOrganization = result;
      this.wizardExtensionComponent.loadShape("MerlotOrganization", 
        this.selectedOrganization.selfDescription.verifiableCredential.credentialSubject["@id"]);
      this.wizardExtensionComponent.prefillFields(result.selfDescription.verifiableCredential.credentialSubject);
    });
  }
}
