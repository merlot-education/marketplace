import { Component, OnInit, ViewChild } from '@angular/core';
import { IOrganizationData } from "../organization-data";
import { AuthService } from 'src/app/services/auth.service';
import { OrganizationsApiService } from 'src/app/services/organizations-api.service';
import { ShaclFile } from '@models/shacl-file';
import { Shape } from '@models/shape';
import { FormfieldControlService } from '@services/form-field.service';
import { WizardExtensionService } from 'src/app/services/wizard-extension.service';

import { DynamicFormComponent } from 'src/app/sdwizard/core/dynamic-form/dynamic-form.component';

@Component({
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit {

  protected selectedOrganization: IOrganizationData = undefined;

  @ViewChild("wizard") private wizard: DynamicFormComponent;

  serviceFiles: string[];
  ecoSystem: string= "merlot";// pass this to getFiles Api
  shaclFile: ShaclFile;
  filteredShapes: Shape[];
  file: ShaclFile = new ShaclFile();

  constructor(protected authService: AuthService, 
    protected organizationsApiService: OrganizationsApiService, 
    private formFieldService: FormfieldControlService,
    private wizardExtensionService: WizardExtensionService) {
    authService.activeOrganizationRole.subscribe(orga => {
      this.selectedOrganization = undefined;
      organizationsApiService.getOrgaById(orga.orgaData.selfDescription.verifiableCredential.credentialSubject['@id']).then(result => {

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
        this.wizardExtensionService.prefillFields(this.wizard, result.selfDescription.verifiableCredential.credentialSubject);
        this.selectShape();
      })
    })
  }

  ngOnInit(): void {
  }


  selectShape(): void {
    this.organizationsApiService.getMerlotParticipantShape().then(
      res => {
        this.shaclFile = this.formFieldService.readShaclFile(res);
        this.filteredShapes = this.formFieldService.updateFilteredShapes(this.shaclFile);
        if (this.filteredShapes.length > 1) {
          console.log("too many shapes selected");
        }
        else {
          // add a field containing the id to avoid creating a new offering
          this.filteredShapes[0].fields.push({
            id: 'user_prefix',
            value: this.selectedOrganization.selfDescription.verifiableCredential.credentialSubject["@id"],
            key: '',
            name: '',
            datatype: {
              prefix: '',
              value: ''
            },
            required: false,
            minCount: 0,
            maxCount: 0,
            order: 0,
            group: '',
            controlTypes: [],
            in: [],
            or: [],
            validations: [],
            componentType: '',
            childrenFields: [],
            childrenSchema: '',
            prefix: '',
            values: [],
            description: '',
            selfLoop: false
          });
          console.log("this here"+this.shaclFile);
          console.table(this.shaclFile);
          this.updateSelectedShape();
        }
      }
    );
  }

  updateSelectedShape(): void {
    const shape = this.filteredShapes[0];
    if (shape !== undefined) {
      this.shaclFile.shapes.find(x => x.name === shape.name).selected = true;
    }
  }
}
