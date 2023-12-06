import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { IOrganizationData } from "../organization-data";
import { AuthService } from 'src/app/services/auth.service';
import { OrganizationsApiService } from 'src/app/services/organizations-api.service';
import { ShaclFile } from '@models/shacl-file';
import { Shape } from '@models/shape';
import { FormfieldControlService } from '@services/form-field.service';
import { WizardExtensionService } from 'src/app/services/wizard-extension.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { WizardExtensionComponent } from 'src/app/wizard-extension/wizard-extension.component';

@Component({
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit, AfterViewInit {

  protected selectedOrganization: IOrganizationData = undefined;

  //@ViewChild("wizard") private wizard: DynamicFormComponent;
  @ViewChild("wizardExtension") private wizardExtensionComponent: WizardExtensionComponent;
  //private wizardExtension: WizardExtension;

  serviceFiles: string[];
  ecoSystem: string= "merlot";// pass this to getFiles Api
  shaclFile: ShaclFile;
  filteredShapes: Shape[];
  file: ShaclFile = new ShaclFile();

  constructor(protected authService: AuthService, 
    protected organizationsApiService: OrganizationsApiService, 
    private formFieldService: FormfieldControlService,
    private wizardExtensionService: WizardExtensionService,
    private route: ActivatedRoute) {
  }
  ngAfterViewInit(): void {
    /*this.wizard.finishedLoadingEvent.subscribe(_ => {
      console.log("Wizard initialized");
    })*/
    let selectedOrgaId = this.route.snapshot.paramMap.get('orgaId');
    if (selectedOrgaId) {
      this.selectOrganization(selectedOrgaId);
    } else {
      this.authService.activeOrganizationRole.subscribe(orga => {
        this.selectOrganization(orga.orgaData.selfDescription.verifiableCredential.credentialSubject['@id']);
      });
    }
  }

  ngOnInit(): void {
  }

  private selectOrganization(orgaId: string) {
    this.selectedOrganization = undefined;
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
      this.wizardExtensionComponent.loadShape("Participant", 
        this.selectedOrganization.selfDescription.verifiableCredential.credentialSubject["@id"]);
      this.wizardExtensionComponent.prefillFields(result.selfDescription.verifiableCredential.credentialSubject);
    });
  }

  //value: this.selectedOrganization.selfDescription.verifiableCredential.credentialSubject["@id"],

}
