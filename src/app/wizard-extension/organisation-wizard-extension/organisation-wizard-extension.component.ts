import { Component, EventEmitter, ViewChild } from '@angular/core';
import { OrganizationsApiService } from '../../services/organizations-api.service';
import { StatusMessageComponent } from '../../views/common-views/status-message/status-message.component';
import { HttpErrorResponse } from '@angular/common/http';
import { ActiveOrganizationRoleService } from 'src/app/services/active-organization-role.service';
import { ConnectorData, IOrganizationData, IOrganizationMetadata } from 'src/app/views/organization/organization-data';
import { ModalComponent } from '@coreui/angular';
import { BaseWizardExtensionComponent } from '../base-wizard-extension/base-wizard-extension.component';


@Component({
  selector: 'app-organisation-wizard-extension',
  templateUrl: './organisation-wizard-extension.component.html',
  styleUrls: ['./organisation-wizard-extension.component.scss']
})
export class OrganisationWizardExtensionComponent {
  @ViewChild("baseWizardExtension") private baseWizardExtension: BaseWizardExtensionComponent;
  @ViewChild("saveStatusMessage") private saveStatusMessage: StatusMessageComponent;
  @ViewChild('modalConfirmation') private modalConfirmation: ModalComponent;

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
    let membershipClassOk = this.isMembershipClassFilled();
    let mailAddressOk = this.isMailAddressFilled();
    let allConnectorsOk = this.activeOrgRoleService.isActiveAsRepresentative ? this.areAllConnectorsValid() : true;

    return membershipClassOk && mailAddressOk && allConnectorsOk;
  }

  public isMailAddressFilled(): boolean {
    return this.orgaMetadata.mailAddress !== null && this.orgaMetadata.mailAddress.trim().length !== 0;
  }

  public isMembershipClassFilled(): boolean {
    return this.orgaMetadata.membershipClass !== null && this.orgaMetadata.membershipClass.trim().length !== 0;
  }

  public areAllConnectorsValid(): boolean {
    for (const connector of this.orgaMetadata.connectors) {
      if (!this.isConnectorValid(connector)) {
        return false;
      }
    }
    return true;
  }

  public isConnectorValid(connector: ConnectorData): boolean {
    // Check if id, endpoint and access token are not empty
    if (!connector.connectorId || !connector.connectorEndpoint || !connector.connectorAccessToken) {
      return false;
    }

    // Check if the list of buckets is valid
    if(!this.areBucketsOfConnectorValid(connector)) {
      return false;
    }
      
    return true
  }
    

  public areBucketsOfConnectorValid(connector: ConnectorData): boolean {
    // Check if the list of buckets is empty
    if (connector.bucketNames.length === 0) {
      return false;
    }

    // Check if all buckets are not empty
    for (const bucket of connector.bucketNames) {
      if (!bucket) {
        return false;
      }
    }

    return true;
  }

  public addConnector() {
    const connector: ConnectorData = {
      connectorId: '', 
      connectorEndpoint: '',
      connectorAccessToken: '',
      bucketNames: []
    };
    this.orgaMetadata.connectors.push(connector);
  }

  public removeConnector(index: number) {
    this.orgaMetadata.connectors.splice(index, 1);
  }

  public addBucket(connector: ConnectorData) {
    connector.bucketNames.push('');
  }

  public removeBucket(connector: ConnectorData, index: number) {
    connector.bucketNames.splice(index, 1);
  }

  public customTrackBy(index: number, obj: any): any {
    return index;
}

  protected isWizardFormInvalid(): boolean {
    return this.baseWizardExtension?.isWizardFormInvalid();
  }
}
