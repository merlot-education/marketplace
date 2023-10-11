import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { ShaclFile } from '@models/shacl-file';
import { Shape } from '@models/shape';
import { FormfieldControlService } from '@services/form-field.service';
import { ITermsAndConditions, serviceFileNameDict } from '../serviceofferings-data';
import { ServiceofferingApiService } from 'src/app/services/serviceoffering-api.service';
import { WizardExtensionService } from 'src/app/services/wizard-extension.service';

@Component({
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit {

  serviceFileNameDict = serviceFileNameDict;

  serviceFiles: string[];
  ecoSystem: string= "merlot";// pass this to getFiles Api
  shaclFile: ShaclFile;
  filteredShapes: Shape[];
  file: ShaclFile = new ShaclFile();

  private ignoredServiceFiles: string[] = ["Merlot ServiceOffering.json"];

  constructor(private serviceofferingsApiService: ServiceofferingApiService, 
    protected authService : AuthService, 
    private formFieldService: FormfieldControlService,
    private wizardExtensionService: WizardExtensionService) {
  }


  ngOnInit(): void {
    this.requestShapes(this.ecoSystem);
  }
  

  requestShapes(system:string){
    //pass the system string down here
    this.serviceofferingsApiService.fetchAvailableShapes(system).then(res => {
      for (let i = 0; i < res?.Service.length;) {
        if (this.ignoredServiceFiles.includes(res?.Service[i])) {
          res?.Service.splice(i, 1);
        } else {
          i += 1;
        }
      }
      this.serviceFiles=res?.Service;
      this.serviceFiles.sort((a, b) => (serviceFileNameDict[a].name < serviceFileNameDict[b].name ? -1 : 1));
      this.select(this.serviceFiles[0]);
    });
  }

  select(name: string): void {
    this.serviceofferingsApiService.fetchShape(name).then(
      res => {
        this.shaclFile = this.formFieldService.readShaclFile(res);
        this.filteredShapes = this.formFieldService.updateFilteredShapes(this.shaclFile);
        if (this.filteredShapes.length > 1) {
          console.log("too many shapes selected");
        }
        else {
          // TODO move to orga
          let merlotTnC: ITermsAndConditions = {
            "gax-trust-framework:content": {
              "@value": "https://merlot-education.eu"
            },
            "gax-trust-framework:hash": {
              "@value": "hash1234"
            }
          }
          let providerTnC: ITermsAndConditions = this.authService.activeOrganizationRole.value.orgaData.selfDescription.verifiableCredential.credentialSubject['merlot:termsAndConditions'];
          this.wizardExtensionService.prefillFields(this.filteredShapes[0].fields, {
            "gax-trust-framework:termsAndConditions": [
              {
                "@type": "gax-trust-framework:TermsAndConditions",
                "gax-trust-framework:content": {
                  "@value": merlotTnC['gax-trust-framework:content']['@value'],
                  "@type": "xsd:anyURI"
                },
                "gax-trust-framework:hash": {
                  "@value": merlotTnC['gax-trust-framework:hash']['@value'],
                  "@type": "xsd:string"
                }
              },
              {
                "@type": "gax-trust-framework:TermsAndConditions",
                "gax-trust-framework:content": {
                  "@value": providerTnC['gax-trust-framework:content']['@value'],
                  "@type": "xsd:anyURI"
                },
                "gax-trust-framework:hash": {
                  "@value": providerTnC['gax-trust-framework:hash']['@value'],
                  "@type": "xsd:string"
                }
              }
            ]
          });
          this.updateSelectedShape();
          //this.router.navigate(['/service-offerings/edit/form'], { state: { file: this.shaclFile } });
        }
      }
    );
  }

  updateSelectedShape(): void {
    const shape = this.filteredShapes[0];
    if (shape !== undefined) {
      let filteredShape = this.shaclFile.shapes.find(x => x.name === shape.name);

      // patch terms and conditions field to no longer be required since our backend will augment it with provider/merlot tnc
      //let tncField = shape?.fields.filter(f => f.key === "termsAndConditions")[0];
      //tncField.minCount = 0;
      //tncField.required = false;

      // select the shape
      filteredShape.selected = true;
    }
  }
}
