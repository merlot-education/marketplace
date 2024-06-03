import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { ActiveOrganizationRoleService } from 'src/app/services/active-organization-role.service';
import { IGxServiceOfferingCs, IServiceOffering, TBR_OFFERING_ID, serviceFileNameDict } from '../serviceofferings-data';
import { ServiceofferingApiService } from 'src/app/services/serviceoffering-api.service';
import { OrganizationsApiService } from 'src/app/services/organizations-api.service';
import { OfferingWizardExtensionComponent } from 'src/app/wizard-extension/offering-wizard-extension/offering-wizard-extension.component';
import { map, skip, takeWhile } from 'rxjs';
import { asMerlotLegalParticipantCs, getMerlotSpecificServiceOfferingTypeFromServiceOfferingSd, getParticipantIdFromParticipantSd, getServiceOfferingIdFromServiceOfferingSd, isMerlotLegalParticipantCs } from 'src/app/utils/credential-tools';
import { IVerifiablePresentation } from '../../organization/organization-data';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit, AfterViewInit {

  serviceFileNameDict = serviceFileNameDict;

  serviceFiles: string[];
  private selectedServiceFile: string = "";

  protected selectedOfferingId: string;

  private initialMessage: string;

  private selectedOffering: IServiceOffering;

  @ViewChild("wizardExtension") private wizardExtension: OfferingWizardExtensionComponent;

  constructor(private serviceofferingsApiService: ServiceofferingApiService, 
    protected authService : AuthService, 
    protected activeOrgRoleService: ActiveOrganizationRoleService,
    private organizationsApiService: OrganizationsApiService,
    private route: ActivatedRoute,
    private router: Router) {
      this.initialMessage = this.router.getCurrentNavigation().extras?.state?.message;
  }
  
  ngAfterViewInit(): void {
    this.selectedOfferingId = this.route.snapshot.paramMap.get('offeringId');
    this.requestShapes();
    if (this.initialMessage) {
      this.wizardExtension.saveStatusMessage.showSuccessMessage(this.initialMessage);
    }
    this.activeOrgRoleService.activeOrganizationRole.pipe(skip(1)).subscribe(_ => {
      this.prefillWizard();
    });
    console.log(this.selectedOfferingId);
  }


  ngOnInit(): void {
  }
  

  requestShapes(){
    //pass the system string down here
    this.serviceFiles = ["saas", "datadelivery", "coopcontract" ];
    this.serviceFiles.sort((a, b) => (serviceFileNameDict[a].name < serviceFileNameDict[b].name ? -1 : 1));
    if (this.selectedOfferingId) {
      this.serviceofferingsApiService.fetchServiceOfferingDetails(this.selectedOfferingId).then(result => {
        this.selectedOffering = result;
        let type = getMerlotSpecificServiceOfferingTypeFromServiceOfferingSd(result.selfDescription);
        let typeFile;
        Object.keys(serviceFileNameDict)
        for (const k of Object.keys(serviceFileNameDict)) {
          const v = serviceFileNameDict[k];
          if (v["type"] === type) {
            typeFile = k;
            break;
          }
        }
        this.select(typeFile);
      });
    } else {
      this.select(this.serviceFiles[0]);
    }
  }


  select(input: string | EventTarget): void {
    this.selectedServiceFile = "";
    if (typeof input === "string") {
      this.selectedServiceFile = input;
    } else if (input instanceof EventTarget) {
      this.selectedServiceFile = (input as HTMLSelectElement).value;
    }
    
    this.prefillWizard();
  }

  prefillWizard() {
    if (this.selectedOfferingId) {
      this.prefillWizardExistingOffering();
      this.wizardExtension.prefillDone
        .pipe(
          takeWhile(done => !done, true)
          )
        .subscribe(done => {
          console.log("wizard done: ", done);
          console.log(this.wizardExtension.saveStatusMessage.isMessageVisible.value);
          if (this.wizardExtension.saveStatusMessage.isMessageVisible.value) {
            window.scrollTo(0,document.body.scrollHeight);
          }
        });
    } else {
      this.prefillWizardNewOffering();
    }
  }

  prefillWizardNewOffering() {
    let merlotFederationSd = this.organizationsApiService.getMerlotFederationOrga().selfDescription;
    let providerSd = this.activeOrgRoleService.activeOrganizationRole.value.orgaData.selfDescription;

    let merlotTnc = this.getOfferingTncFromParticipantSd(merlotFederationSd);
    let providerTnc = this.getOfferingTncFromParticipantSd(providerSd);

    let gxServiceOfferingCs = {
      "gx:providedBy": {
        "@id": getParticipantIdFromParticipantSd(providerSd)
      },
      "gx:termsAndConditions": [
        merlotTnc,
        providerTnc
      ],
      type: "gx:ServiceOffering"
    }

    let merlotServiceOfferingCs = {
      type: "merlot:MerlotServiceOffering"
    };

    let prefillSd = {
      selfDescription: {
        id: '',
        verifiableCredential: [
          {credentialSubject: gxServiceOfferingCs},
          {credentialSubject: merlotServiceOfferingCs}
        ]
      }
    }

    this.wizardExtension.loadShape(this.selectedServiceFile, TBR_OFFERING_ID).then(_ => {
      this.wizardExtension.prefillFields(prefillSd);
    });
    
  }

  prefillWizardExistingOffering() {
    this.wizardExtension.loadShape(this.selectedServiceFile, 
      getServiceOfferingIdFromServiceOfferingSd(this.selectedOffering.selfDescription)).then(_ => {
      this.wizardExtension.prefillFields(this.selectedOffering);
    });
    
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

      // if EDC is not configured for IONOS (only method right now), reject
      if (!connector.ionosS3ExtensionConfig?.buckets || connector.ionosS3ExtensionConfig.buckets.length == 0) {
        return false;
      }
  
      // Check if all bucket names are valid
      for (const bucket of connector.ionosS3ExtensionConfig.buckets) {
        if (!this.isValidString(bucket.name)) {
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

  private getOfferingTncFromParticipantSd(participantSd: IVerifiablePresentation) {
    for (let vc of participantSd.verifiableCredential) {
      if (isMerlotLegalParticipantCs(vc.credentialSubject)) {
        let tnc = asMerlotLegalParticipantCs(vc.credentialSubject)['merlot:termsAndConditions']
        return {
          "gx:URL": tnc['merlot:URL'],
          "gx:hash": tnc["merlot:hash"]
        }
      }
    }
  }
}
