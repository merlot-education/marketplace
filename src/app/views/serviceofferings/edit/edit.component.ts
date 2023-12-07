import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { ActiveOrganizationRoleService } from 'src/app/services/active-organization-role.service';
import { ITermsAndConditions, serviceFileNameDict } from '../serviceofferings-data';
import { ServiceofferingApiService } from 'src/app/services/serviceoffering-api.service';
import { OrganizationsApiService } from 'src/app/services/organizations-api.service';
import { WizardExtensionComponent } from 'src/app/wizard-extension/wizard-extension.component';

@Component({
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit, AfterViewInit {

  serviceFileNameDict = serviceFileNameDict;

  serviceFiles: string[];

  @ViewChild("wizardExtension") private wizardExtension: WizardExtensionComponent;

  private ignoredServiceFiles: string[] = ["Merlot ServiceOffering.json"];

  constructor(private serviceofferingsApiService: ServiceofferingApiService, 
    protected authService : AuthService, 
    protected activeOrgRoleService: ActiveOrganizationRoleService,
    private organizationsApiService: OrganizationsApiService) {
  }
  
  ngAfterViewInit(): void {
    this.requestShapes();
    this.activeOrgRoleService.activeOrganizationRole.subscribe(role => {
      this.patchWizardTnC();
    });
  }


  ngOnInit(): void {
  }
  

  requestShapes(){
    //pass the system string down here
    this.serviceofferingsApiService.fetchAvailableShapes("merlot").then(res => {
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
    this.wizardExtension.loadShape(name, "ServiceOffering:TBR");
    this.patchWizardTnC();
  }

  patchWizardTnC() {
    let merlotTnC = this.organizationsApiService.getMerlotFederationOrga().selfDescription.verifiableCredential.credentialSubject['merlot:termsAndConditions'];
    let providerTnC: ITermsAndConditions = this.activeOrgRoleService.activeOrganizationRole.value.orgaData.selfDescription.verifiableCredential.credentialSubject['merlot:termsAndConditions'];
    this.wizardExtension.prefillFields({
      "gax-core:offeredBy": {
        "@id": this.activeOrgRoleService.getActiveOrgaLegalName(),
        "disabled": true
      },
      "gax-trust-framework:providedBy": {
        "@id": this.activeOrgRoleService.getActiveOrgaLegalName(),
        "disabled": true
      },
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
    });
  }
}
