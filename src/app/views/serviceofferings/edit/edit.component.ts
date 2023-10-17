import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { ShaclFile } from '@models/shacl-file';
import { Shape } from '@models/shape';
import { FormfieldControlService } from '@services/form-field.service';
import { ITermsAndConditions, serviceFileNameDict } from '../serviceofferings-data';
import { ServiceofferingApiService } from 'src/app/services/serviceoffering-api.service';
import { WizardExtensionService } from 'src/app/services/wizard-extension.service';
import { OrganizationsApiService } from 'src/app/services/organizations-api.service';
import { DynamicFormComponent } from 'src/app/sdwizard/core/dynamic-form/dynamic-form.component';

@Component({
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit, AfterViewInit {

  serviceFileNameDict = serviceFileNameDict;

  serviceFiles: string[];
  ecoSystem: string= "merlot";// pass this to getFiles Api
  shaclFile: ShaclFile;
  filteredShapes: Shape[];
  file: ShaclFile = new ShaclFile();

  @ViewChild("wizard") private wizard: DynamicFormComponent;

  private ignoredServiceFiles: string[] = ["Merlot ServiceOffering.json"];

  constructor(private serviceofferingsApiService: ServiceofferingApiService, 
    protected authService : AuthService, 
    private formFieldService: FormfieldControlService,
    private wizardExtensionService: WizardExtensionService,
    private organizationsApiService: OrganizationsApiService) {
  }
  
  ngAfterViewInit(): void {
    this.authService.activeOrganizationRole.subscribe(role => {
      console.log(role);
      this.patchWizardTnC(true);
    });
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


  select(input: string | EventTarget): void {
    let name = "";
    if (typeof input === "string") {
      name = input;
    } else if (input instanceof EventTarget) {
      name = (input as HTMLSelectElement).value;
    }
    this.serviceofferingsApiService.fetchShape(name).then(
      res => {
        this.shaclFile = this.formFieldService.readShaclFile(res);
        this.filteredShapes = this.formFieldService.updateFilteredShapes(this.shaclFile);
        if (this.filteredShapes.length > 1) {
          console.log("too many shapes selected");
        }
        else {
          this.updateSelectedShape();
          this.patchWizardTnC();
        }
      }
    );
  }

  patchWizardTnC(forceImmediateRefresh: boolean = false) {
    let merlotTnC = this.organizationsApiService.getMerlotFederationOrga().selfDescription.verifiableCredential.credentialSubject['merlot:termsAndConditions'];
    let providerTnC: ITermsAndConditions = this.authService.activeOrganizationRole.value.orgaData.selfDescription.verifiableCredential.credentialSubject['merlot:termsAndConditions'];
    this.wizardExtensionService.prefillFields(this.wizard, {
      "gax-trust-framework:termsAndConditions": [
        {
          "@type": "gax-trust-framework:TermsAndConditions",
          "overrideName": "Merlot AGB",
          "gax-trust-framework:content": {
            "@value": merlotTnC['gax-trust-framework:content']['@value'],
            "@type": "xsd:anyURI",
            "disabled": true
          },
          "gax-trust-framework:hash": {
            "@value": merlotTnC['gax-trust-framework:hash']['@value'],
            "@type": "xsd:string",
            "disabled": true
          }
        },
        {
          "@type": "gax-trust-framework:TermsAndConditions",
          "overrideName": "Anbieter AGB",
          "gax-trust-framework:content": {
            "@value": providerTnC['gax-trust-framework:content']['@value'],
            "@type": "xsd:anyURI",
            "disabled": true
          },
          "gax-trust-framework:hash": {
            "@value": providerTnC['gax-trust-framework:hash']['@value'],
            "@type": "xsd:string",
            "disabled": true
          }
        }
      ],
      "gax-trust-framework:policy": [{
        "@value": "dummyValue",
        "@type": "xsd:string",
      }],
      "gax-trust-framework:dataAccountExport": {
        "gax-trust-framework:requestType": {
          "@value": "dummyValue",
          "@type": "xsd:string",
        },
        "gax-trust-framework:accessType": {
          "@value": "dummyValue",
          "@type": "xsd:string",
        },
        "gax-trust-framework:formatType": {
          "@value": "dummyValue",
          "@type": "xsd:string",
        }
      }
    }, forceImmediateRefresh);
  }

  updateSelectedShape(): void {
    const shape = this.filteredShapes[0];
    if (shape !== undefined) {
      let filteredShape = this.shaclFile.shapes.find(x => x.name === shape.name);

      // patch terms and conditions field to no longer be required since our backend will augment it with provider/merlot tnc
      let tncField = shape?.fields.filter(f => f.key === "termsAndConditions")[0];
      tncField.minCount = 2;

      // select the shape
      filteredShape.selected = true;
    }
  }
}
