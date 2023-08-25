import { Component, OnInit } from '@angular/core';
import { IOrganizationData } from "../organization-data";
import { AuthService } from 'src/app/services/auth.service';
import { OrganizationsApiService } from 'src/app/services/organizations-api.service';
import { ShaclFile } from '@models/shacl-file';
import { Shape } from '@models/shape';
import { FormfieldControlService } from '@services/form-field.service';
import { WizardExtensionService } from 'src/app/services/wizard-extension.service';

@Component({
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit {

  protected selectedOrganization: IOrganizationData = null;

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
      this.selectedOrganization = null;
      organizationsApiService.getOrgaById(orga.orgaData.selfDescription.verifiableCredential.credentialSubject['@id']).then(result => {
        this.selectShape();
        this.selectedOrganization = result;
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
          this.wizardExtensionService.prefillFields(this.filteredShapes[0].fields, this.selectedOrganization.selfDescription.verifiableCredential.credentialSubject);
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

  saveOrganisationEdit(orga: IOrganizationData) {
    orga.selfDescription.verifiableCredential.credentialSubject['gax-trust-framework:headquarterAddress'] = orga.selfDescription.verifiableCredential.credentialSubject['gax-trust-framework:legalAddress'];
    console.log(orga);
  }
}
