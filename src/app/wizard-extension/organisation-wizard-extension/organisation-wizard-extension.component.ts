import { Component, EventEmitter, ViewChild } from '@angular/core';
import { OrganizationsApiService } from '../../services/organizations-api.service';
import { StatusMessageComponent } from '../../views/common-views/status-message/status-message.component';
import { HttpErrorResponse } from '@angular/common/http';
import { ActiveOrganizationRoleService } from 'src/app/services/active-organization-role.service';
import { ConnectorData, IOrganizationData, IOrganizationMetadata, IOrganisationSignerConfig } from 'src/app/views/organization/organization-data';
import { ModalComponent } from '@coreui/angular';
import { BaseWizardExtensionComponent } from '../base-wizard-extension/base-wizard-extension.component';
import { OrganisationIonosS3ConfigComponent } from '../organisation-ionos-s3-config/organisation-ionos-s3-config.component';


@Component({
  selector: 'app-organisation-wizard-extension',
  templateUrl: './organisation-wizard-extension.component.html',
  styleUrls: ['./organisation-wizard-extension.component.scss']
})
export class OrganisationWizardExtensionComponent {
  @ViewChild("baseWizardExtension") private baseWizardExtension: BaseWizardExtensionComponent;
  @ViewChild("saveStatusMessage") private saveStatusMessage: StatusMessageComponent;
  @ViewChild("modalConfirmation") private modalConfirmation: ModalComponent;
  @ViewChild("ionosS3Config") private ionosS3Config: OrganisationIonosS3ConfigComponent;
  

  public submitCompleteEvent: EventEmitter<any> = new EventEmitter();

  protected submitButtonsDisabled: boolean = false;  
  protected orgaActiveSelection: string = "false";
  protected orgaMetadata: IOrganizationMetadata = null;

  constructor(
      protected organizationsApiService: OrganizationsApiService,
      protected activeOrgRoleService: ActiveOrganizationRoleService
    ) {}

  public async loadShape(id: string): Promise<void> {
    console.log("Loading MERLOT Organisation shape");
    await this.baseWizardExtension.loadShape(this.organizationsApiService.getMerlotParticipantShape(), id);
  }

  public isShapeLoaded(): boolean {
    return this.baseWizardExtension?.isShapeLoaded();
  }

  private activeStringToBoolean(active: string) { 
    return active === "true";
  }

  private activeBooleanToString(active: boolean) { 
    return active ? "true": "false";
  }

  public prefillOrganisation(orga: IOrganizationData) {
    this.orgaMetadata = orga.metadata;

    if (!this.orgaMetadata.organisationSignerConfigDto) {
      const emptySignerConfig : IOrganisationSignerConfig = {
        privateKey : "",
        verificationMethod :  "",
      }

      this.orgaMetadata.organisationSignerConfigDto = emptySignerConfig;
    }

    this.orgaActiveSelection = this.activeBooleanToString(orga.metadata.active);
    this.baseWizardExtension.prefillFields(orga.selfDescription.verifiableCredential.credentialSubject);
  }

  private async saveSelfDescription(jsonSd: any) {
    this.orgaMetadata.active = this.activeStringToBoolean(this.orgaActiveSelection);
    const editedOrganisationData : IOrganizationData = {
      id: jsonSd["@id"],
      metadata: this.orgaMetadata,
      selfDescription: {
        verifiableCredential: {
          credentialSubject: jsonSd,
        },
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

    let jsonSd = this.baseWizardExtension.generateJsonSd();

    this.saveSelfDescription(jsonSd).then(result => {
      console.log(result);
      this.baseWizardExtension.setCredentialId(result["id"]);
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
    this.baseWizardExtension.ngOnDestroy();
    this.saveStatusMessage.hideAllMessages();
    this.submitButtonsDisabled = false;
  }

  public isOrganizationMetadataFilled(): boolean {
    let isActiveRepresentative = this.activeOrgRoleService.isActiveAsRepresentative();
    let membershipClassOk = this.isMembershipClassFilled();
    let mailAddressOk = this.isMailAddressFilled();
    let connectorListOk = isActiveRepresentative ? this.isConnectorListValid() : true;
    let signerConfigOk = isActiveRepresentative ? this.isSignerConfigValid() : true;

    return membershipClassOk && mailAddressOk && connectorListOk && signerConfigOk;
  }

  public isMailAddressFilled(): boolean {
    return this.isFieldFilled(this.orgaMetadata.mailAddress);
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

  public isSignerConfigValid(): boolean {
    return this.orgaMetadata.organisationSignerConfigDto 
    && this.isFieldFilled(this.orgaMetadata.organisationSignerConfigDto.privateKey) 
    && this.isFieldFilled(this.orgaMetadata.organisationSignerConfigDto.verificationMethod);
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

  public removeConnector(index: number) {
    this.orgaMetadata.connectors.splice(index, 1);
  }

  protected isWizardFormInvalid(): boolean {
    return this.baseWizardExtension?.isWizardFormInvalid();
  }
}
