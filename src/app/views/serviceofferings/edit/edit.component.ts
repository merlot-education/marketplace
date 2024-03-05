import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { ActiveOrganizationRoleService } from 'src/app/services/active-organization-role.service';
import { ITermsAndConditions, serviceFileNameDict } from '../serviceofferings-data';
import { ServiceofferingApiService } from 'src/app/services/serviceoffering-api.service';
import { OrganizationsApiService } from 'src/app/services/organizations-api.service';
import { OfferingWizardExtensionComponent } from 'src/app/wizard-extension/offering-wizard-extension/offering-wizard-extension.component';
import { skip } from 'rxjs';

@Component({
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit, AfterViewInit {

  serviceFileNameDict = serviceFileNameDict;

  serviceFiles: string[];
  private selectedServiceFile: string = "";

  @ViewChild("wizardExtension") private wizardExtension: OfferingWizardExtensionComponent;

  private ignoredServiceFiles: string[] = ["Merlot ServiceOffering.json"];

  constructor(private serviceofferingsApiService: ServiceofferingApiService, 
    protected authService : AuthService, 
    protected activeOrgRoleService: ActiveOrganizationRoleService,
    private organizationsApiService: OrganizationsApiService) {
  }
  
  ngAfterViewInit(): void {
    this.requestShapes();
    this.activeOrgRoleService.activeOrganizationRole.pipe(skip(1)).subscribe(_ => {
      this.prefillWizard(false);
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
    this.selectedServiceFile = "";
    if (typeof input === "string") {
      this.selectedServiceFile = input;
    } else if (input instanceof EventTarget) {
      this.selectedServiceFile = (input as HTMLSelectElement).value;
    }
    
    this.prefillWizard(true);
  }

  prefillWizard(changeShape: boolean) {
    let merlotTnC = this.organizationsApiService.getMerlotFederationOrga().selfDescription.verifiableCredential.credentialSubject['merlot:termsAndConditions'];
    let providerTnC: ITermsAndConditions = this.activeOrgRoleService.activeOrganizationRole.value.orgaData.selfDescription.verifiableCredential.credentialSubject['merlot:termsAndConditions'];
    
    let prefillSd = {
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
    };
  
    if (changeShape) {
      this.wizardExtension.loadShape(this.selectedServiceFile, "ServiceOffering:TBR").then(_ => {
        this.wizardExtension.prefillFields(prefillSd);
      });
    } else {
      this.wizardExtension.prefillFields(prefillSd);
    }
    
  }

  isOfferingDataDeliveryOffering(): boolean {
    return this.selectedServiceFile.includes("DataDelivery");
  }

  isAnyConnectorAvailable(): boolean {
    let connectors = this.activeOrgRoleService.activeOrganizationRole.value.orgaData.metadata.connectors;
    return connectors && connectors.length !== 0;
  }

  isConnectorListValid(): boolean {
    let connectors = this.activeOrgRoleService.activeOrganizationRole.value.orgaData.metadata.connectors;
    // check if all given connectors are valid
    // if there are no connectors at all, that is also valid
    for (const connector of connectors) {
      if (!this.isValidString(connector.connectorId) || !this.isValidString(connector.connectorEndpoint) || !this.isValidString(connector.connectorAccessToken)) {
        return false;
      }
  
      // Check if all bucket names are valid
      // if there are no buckets at all, that is also valid
      for (const bucket of connector.bucketNames) {
        if (!this.isValidString(bucket)) {
          return false;
        }
      }
    }
    return true;
  }

  isValidString(str: string){
    if (!str || str.trim().length === 0) {
      return false;
    }

    return true;
  }
}
