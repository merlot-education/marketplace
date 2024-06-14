import { Component, EventEmitter, ViewChild } from '@angular/core';
import { OrganizationsApiService } from '../../services/organizations-api.service';
import { StatusMessageComponent } from '../../views/common-views/status-message/status-message.component';
import { ActiveOrganizationRoleService } from 'src/app/services/active-organization-role.service';
import { ConnectorData, ICredentialSubject, IOrganizationData, IOrganizationMetadata, IVerifiableCredential } from 'src/app/views/organization/organization-data';
import { ModalComponent } from '@coreui/angular';
import { BaseWizardExtensionComponent } from '../base-wizard-extension/base-wizard-extension.component';
import { OrganisationIonosS3ConfigComponent } from '../organisation-ionos-s3-config/organisation-ionos-s3-config.component';
import { environment } from 'src/environments/environment';
import { isLegalParticipantCs, isLegalRegistrationNumberCs, isMerlotLegalParticipantCs } from 'src/app/utils/credential-tools';
import { HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, takeWhile } from 'rxjs';


@Component({
  selector: 'app-organisation-wizard-extension',
  templateUrl: './organisation-wizard-extension.component.html',
  styleUrls: ['./organisation-wizard-extension.component.scss']
})
export class OrganisationWizardExtensionComponent {
  @ViewChild("gxParticipantWizard") private gxParticipantWizard: BaseWizardExtensionComponent;
  @ViewChild("gxRegistrationNumberWizard") private gxRegistrationNumberWizard: BaseWizardExtensionComponent;
  @ViewChild("merlotParticipantWizard") private merlotParticipantWizard: BaseWizardExtensionComponent;

  @ViewChild("saveStatusMessage") public saveStatusMessage: StatusMessageComponent;
  @ViewChild("modalConfirmation") private modalConfirmation: ModalComponent;
  @ViewChild("ionosS3Config") private ionosS3Config: OrganisationIonosS3ConfigComponent;
  

  public submitCompleteEvent: EventEmitter<any> = new EventEmitter();

  protected submitButtonsDisabled: boolean = false;  
  protected orgaActiveSelection: string = "false";
  protected orgaMetadata: IOrganizationMetadata = null;
  protected gxTermsAndConditions = {
    version: "",
    text: ""
  }

  protected environment = environment;

  public prefillDone: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
      protected organizationsApiService: OrganizationsApiService,
      protected activeOrgRoleService: ActiveOrganizationRoleService
    ) {}

  public async loadShape(id: string): Promise<void> {
    this.prefillDone.next(false);
    console.log("Loading MERLOT Organisation shape");
    await this.gxParticipantWizard.loadShape(this.organizationsApiService.getGxParticipantShape(), id);
    await this.gxRegistrationNumberWizard.loadShape(this.organizationsApiService.getGxRegistrationNumberShape(), id + "#registrationNumber");
    await this.merlotParticipantWizard.loadShape(this.organizationsApiService.getMerlotParticipantShape(), id);
  }

  public isShapeLoaded(): boolean {
    return this.gxParticipantWizard?.isShapeLoaded() && this.gxRegistrationNumberWizard?.isShapeLoaded() && this.merlotParticipantWizard?.isShapeLoaded();
  }

  private activeStringToBoolean(active: string) { 
    return active === "true";
  }

  private activeBooleanToString(active: boolean) { 
    return active ? "true": "false";
  }

  private getMerlotLegalParticipantDisabledFields() {
    return this.activeOrgRoleService.isActiveAsFedAdmin() 
      ? [] 
      : ["merlot:legalName", "merlot:legalForm"];
  }

  private getGxLegalParticipantDisabledFields() {
    return this.activeOrgRoleService.isActiveAsFedAdmin() 
      ? ["gx:legalRegistrationNumber", "gx:subOrganization", "gx:parentOrganization"] 
      : ["gx:legalRegistrationNumber", "gx:name", "gx:subOrganization", "gx:parentOrganization"];
  }

  private getGxRegistrationNumberDisabledFields() {
    return this.activeOrgRoleService.isActiveAsFedAdmin() 
      ? [] 
      : ["gx:leiCode", "gx:vatID", "gx:EORI", "gx:EUID", "gx:taxID"];
  }

  private prefillHandleCs(cs: ICredentialSubject) {
    if (isMerlotLegalParticipantCs(cs)) {
      this.merlotParticipantWizard.prefillFields(cs, 
        this.getMerlotLegalParticipantDisabledFields());
    }
    if(isLegalParticipantCs(cs)) {
      this.gxParticipantWizard.prefillFields(cs, 
        this.getGxLegalParticipantDisabledFields());
    }
    if (isLegalRegistrationNumberCs(cs)) {
      this.gxRegistrationNumberWizard.prefillFields(cs, 
        this.getGxRegistrationNumberDisabledFields());
    }
  }

  public prefillOrganisation(orga: IOrganizationData) {
    this.orgaMetadata = orga.metadata;
    this.orgaActiveSelection = this.activeBooleanToString(orga.metadata.active);

    for (let vc of orga.selfDescription.verifiableCredential) {
      this.prefillHandleCs(vc.credentialSubject);
    }
    
    this.organizationsApiService.getGxTermsAndConditions().then(result => {
      this.gxTermsAndConditions = result;
    });

    this.gxParticipantWizard.prefillDone
      .pipe(
        takeWhile(done => !done, true)
        )
      .subscribe(done => {
      if (done) {
        this.gxRegistrationNumberWizard.prefillDone.pipe(
          takeWhile(done => !done, true)
          )
        .subscribe(done => {
          if (done) {
            this.merlotParticipantWizard.prefillDone.pipe(
              takeWhile(done => !done, true)
              )
            .subscribe(done => {
              if (done) {
                this.prefillDone.next(true);
              }
            });
          }
        });
      }
    });
  }

  private async saveSelfDescription(id: string, credentials: IVerifiableCredential[]) {
    this.orgaMetadata.active = this.activeStringToBoolean(this.orgaActiveSelection);
    const editedOrganisationData : IOrganizationData = {
      id: id,
      metadata: this.orgaMetadata,
      selfDescription: {
        id: id,
        verifiableCredential: credentials,
      },
      activeRepresentant: false,
      passiveRepresentant: false,
      activeFedAdmin: false,
      passiveFedAdmin: false
    };
    console.log(editedOrganisationData);
    return await this.organizationsApiService.saveOrganization(editedOrganisationData);
  }

  protected checkConfirmationNeeded() {
    if (this.orgaActiveSelection === "false" && this.orgaMetadata.active) {
      this.modalConfirmation.visible = true;
    } else {
      this.onSubmit();
    }
  }

  protected onSubmit(): void {
    console.log("onSubmit");
    this.submitButtonsDisabled = true;
    this.saveStatusMessage.hideAllMessages();

    let legalParticipantVc: IVerifiableCredential =  { credentialSubject: this.gxParticipantWizard.generateJsonCs() };
    let legalRegistrationNumberVc: IVerifiableCredential = { credentialSubject: this.gxRegistrationNumberWizard.generateJsonCs() };
    let merlotParticipantVc: IVerifiableCredential = { credentialSubject: this.merlotParticipantWizard.generateJsonCs() };

    console.log("legalParticipantVc", legalParticipantVc);
    console.log("legalRegistrationNumberVc", legalRegistrationNumberVc);
    console.log("merlotParticipantVc", merlotParticipantVc);

    this.saveSelfDescription(legalParticipantVc.credentialSubject.id, 
      [legalParticipantVc, legalRegistrationNumberVc, merlotParticipantVc]).then(result => {
      console.log(result);
      this.saveStatusMessage.showSuccessMessage("ID: " + result["id"]);
      this.submitCompleteEvent.emit(null);
      this.prefillOrganisation(result);
    }).catch((e: HttpErrorResponse) => {
      this.saveStatusMessage.showErrorMessage(e.error.message);
    })
    .catch(_ => {
      this.saveStatusMessage.showErrorMessage("Unbekannter Fehler");
    }).finally(() => {
      this.submitButtonsDisabled = false;
    });
  }

  public ngOnDestroy() {
    this.gxParticipantWizard.ngOnDestroy();
    this.gxRegistrationNumberWizard.ngOnDestroy();
    this.merlotParticipantWizard.ngOnDestroy();
    this.saveStatusMessage.hideAllMessages();
    this.submitButtonsDisabled = false;
  }

  public isOrganizationMetadataFilled(): boolean {
    let isActiveRepresentative = this.activeOrgRoleService.isActiveAsRepresentative();
    let membershipClassOk = this.isMembershipClassFilled();
    let mailAddressOk = this.isMailAddressFilled();
    let ocmAgentSettingsOk = this.isOcmAgentSettingsFilled();
    let connectorListOk = isActiveRepresentative ? this.isConnectorListValid() : true;

    return membershipClassOk && mailAddressOk && ocmAgentSettingsOk && connectorListOk;
  }

  public isMailAddressFilled(): boolean {
    return this.isFieldFilled(this.orgaMetadata.mailAddress);
  }

  public isOcmAgentSettingsFilled(): boolean {
    let allFilled = this.orgaMetadata.ocmAgentSettings !== undefined;
    for (let setting of this.orgaMetadata.ocmAgentSettings) {
      allFilled &&= this.isFieldFilled(setting.agentDid);
    }
    return allFilled;
  }

  public isMembershipClassFilled(): boolean {
    return this.isFieldFilled(this.orgaMetadata.membershipClass);
  }

  public isConnectorListValid(): boolean {
    // check if all given connectors are valid
    // if there are no connectors at all, that is also valid
    for (const connector of this.orgaMetadata.connectors) {
      if (!this.isConnectorValid(connector)) {
        return false;
      }
    }
    return true;
  }

  public isConnectorValid(connector: ConnectorData): boolean {
    // Check if id, endpoint and access token are not empty
    if (!this.isFieldFilled(connector.connectorId) || !this.isFieldFilled(connector.connectorEndpoint) || !this.isFieldFilled(connector.connectorAccessToken)) {
      return false;
    }

    if (connector.ionosS3ExtensionConfig && !this.ionosS3Config?.isIonosS3ExtensionConfigValid()) {
      return false;
    }
      
    return true
  }

  public isFieldFilled(str: string){
    if (!str || str.trim().length === 0) {
      return false;
    }

    return true;
  }

  public addConnector() {
    if (!this.orgaMetadata.connectors) {
      this.orgaMetadata.connectors = []
    }
    const connector: ConnectorData = {
      connectorId: "", 
      connectorEndpoint: "",
      connectorAccessToken: ""
    };
    this.orgaMetadata.connectors.push(connector);
  }

  public addOcmAgentSetting() {
    if (!this.orgaMetadata.ocmAgentSettings) {
      this.orgaMetadata.ocmAgentSettings = []
    }
    this.orgaMetadata.ocmAgentSettings.push({agentDid: ""});
  }

  public removeConnector(index: number) {
    this.orgaMetadata.connectors.splice(index, 1);
  }

  public removeOcmAgentSetting(index: number) {
    this.orgaMetadata.ocmAgentSettings.splice(index, 1);
  }

  protected isWizardFormInvalid(): boolean {
    return this.gxParticipantWizard?.isWizardFormInvalid() 
      || this.gxRegistrationNumberWizard?.isWizardFormInvalid() 
      || this.merlotParticipantWizard?.isWizardFormInvalid();
  }
}
