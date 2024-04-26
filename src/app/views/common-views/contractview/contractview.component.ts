import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { IContract, IDataDeliveryContract, IEdcIdResponse, IEdcNegotiationStatus, IEdcTransferStatus, ISaasContract } from '../../contracts/contracts-data';
import { ContractApiService } from 'src/app/services/contract-api.service';
import { OrganizationsApiService } from 'src/app/services/organizations-api.service';
import { ServiceofferingApiService } from 'src/app/services/serviceoffering-api.service';
import { ActiveOrganizationRoleService } from 'src/app/services/active-organization-role.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ConnectorData } from 'src/app/views/organization/organization-data';
import { saveAs } from 'file-saver';
import { StatusMessageComponent } from '../status-message/status-message.component';


const sleep = (ms) => new Promise(r => setTimeout(r, ms));

@Component({
  selector: 'app-contractview',
  templateUrl: './contractview.component.html',
  styleUrls: ['./contractview.component.scss']
})
export class ContractviewComponent {

  @Input() contractDetails: IContract = undefined;
  @Input() availableConnectors : ConnectorData[] = [];
  @Output() buttonClickCallback: EventEmitter<any> = new EventEmitter();

  @ViewChild('contractStatusMessage') private contractStatusMessage: StatusMessageComponent;
  @ViewChild('edcStatusMessage') private edcStatusMessage: StatusMessageComponent;
  @ViewChild('contractPdfDownloadMessage') private contractPdfDownloadMessage: StatusMessageComponent;

  protected saveButtonDisabled: boolean = false;

  constructor(
    protected contractApiService: ContractApiService,
    private activeOrgRoleService: ActiveOrganizationRoleService,
    protected serviceOfferingApiService: ServiceofferingApiService,
    protected organizationsApiService: OrganizationsApiService) {
  }

  protected handleButtonClick(targetFunction: (contractApiService: ContractApiService, contractDetails: IContract) => Promise<IContract>, contractDetails: IContract) {
    console.log("sent", contractDetails);
    this.saveButtonDisabled = true;
    this.contractStatusMessage.hideAllMessages();

    targetFunction(this.contractApiService, contractDetails).then(result => {
        this.contractDetails = result;
        this.contractStatusMessage.showSuccessMessage("", 5000);
        console.log("received", result);
        this.buttonClickCallback.emit();
      })
      .catch((e: HttpErrorResponse) => {
        console.log(e);
        this.contractStatusMessage.showErrorMessage(e.error.message);
      })
      .catch(e => {
        console.log(e);
        this.contractStatusMessage.showErrorMessage("Unbekannter Fehler.");
      })
      .finally(() => {
        this.saveButtonDisabled = false;
      });
  }

  protected async saveContract(contractApiService: ContractApiService, contractDetails: IContract): Promise<IContract> {
    return await contractApiService.updateContract(contractDetails);
  }

  protected async deleteContract(contractApiService: ContractApiService, contractDetails: IContract): Promise<IContract> {
    return await contractApiService.statusShiftContract(contractDetails.details.id, 'DELETED');
  }

  protected async purgeContract(contractApiService: ContractApiService, contractDetails: IContract): Promise<IContract> {
    return await contractApiService.statusShiftContract(contractDetails.details.id, 'PURGED');
  }

  protected async orderContract(contractApiService: ContractApiService, contractDetails: IContract): Promise<IContract> {
    return await contractApiService.updateContract(contractDetails).then(result =>  
      contractApiService.statusShiftContract(contractDetails.details.id, 'SIGNED_CONSUMER'));
  }

  protected async acceptOrderContract(contractApiService: ContractApiService, contractDetails: IContract): Promise<IContract> {
    return await contractApiService.updateContract(contractDetails).then(result =>  
      contractApiService.statusShiftContract(contractDetails.details.id, 'RELEASED'));
  }

  protected async revokeContract(contractApiService: ContractApiService, contractDetails: IContract): Promise<IContract> {
    return await contractApiService.statusShiftContract(contractDetails.details.id, 'REVOKED');
  }

  protected async archiveContract(contractApiService: ContractApiService, contractDetails: IContract): Promise<IContract> {
    return await contractApiService.statusShiftContract(contractDetails.details.id, 'ARCHIVED');
  }

  protected async regenerateContract(contractApiService: ContractApiService, contractDetails: IContract): Promise<IContract> {
    return await contractApiService.regenerateContract(contractDetails.details.id);
  }

  protected isDataTransferDisabled(contractDetails: IContract) {
    return (contractDetails.offering.selfDescription.verifiableCredential.credentialSubject['merlot:dataTransferType']['@value'] === 'Push' && this.userIsActiveConsumer()) 
           || (contractDetails.offering.selfDescription.verifiableCredential.credentialSubject['merlot:dataTransferType']['@value'] === 'Pull' && this.userIsActiveProvider());
  }  
  protected isDataTransferButtonVisible(contractDetails: IContract) {
    return contractDetails.type === 'DataDeliveryContractTemplate' 
           && contractDetails.details.state === 'RELEASED';
  }  
  protected initiateDataTransfer(contractDetails: IContract) {
    this.saveButtonDisabled = true;
    this.edcStatusMessage.showInfoMessage("Starte EDC Verhandlung...");
    console.log("Initiate transfer");
    this.contractApiService.initiateEdcNegotiation(contractDetails.details.id).then(async (negotiationId: IEdcIdResponse) => {
      console.log(negotiationId);
      try {
        let negotiationState: IEdcNegotiationStatus = {
          id: '',
          state: '',
          contractAgreementId: ''
        }
        while (negotiationState.state !== "FINALIZED") {
          negotiationState = await this.contractApiService.getEdcNegotiationStatus(contractDetails.details.id, negotiationId.id);
          this.edcStatusMessage.showInfoMessage("EDC Verhandlung gestartet. Aktueller Status: " + negotiationState.state);
          console.log(negotiationState);
          await sleep(1000);
        }
        this.edcStatusMessage.showInfoMessage("EDC Verhandlung abgeschlossen. Starte EDC Datentransfer...");
      } catch (e) {
        this.edcStatusMessage.showErrorMessage("Verhandlungsfehler: " + e.message);
        this.saveButtonDisabled = false;
      }

      this.contractApiService.initiateEdcTransfer(contractDetails.details.id, negotiationId.id).then(async (transferId: IEdcIdResponse) => {
        console.log(transferId);
        try {
          let transferState: IEdcTransferStatus = {
            id: '',
            state: ''
          }
          while (transferState.state !== "COMPLETED") {
            transferState = await this.contractApiService.getEdcTransferStatus(contractDetails.details.id, transferId.id);
            this.edcStatusMessage.showInfoMessage("EDC Datentransfer gestartet. Aktueller Status: " + transferState.state);
            console.log(transferState);
            await sleep(1000);
          }
          this.edcStatusMessage.showSuccessMessage("", 5000);
        } catch (e) {
          this.edcStatusMessage.showErrorMessage("Transferfehler: " + e.message);
        }
        
        this.saveButtonDisabled = false;
      })
    }).catch((e: HttpErrorResponse) => {
      this.edcStatusMessage.showErrorMessage("Kommunikationsfehler: " + e.error.message);
      this.saveButtonDisabled = false;
    }).catch(e => {
      this.edcStatusMessage.showErrorMessage("Unbekannter Fehler");
      this.saveButtonDisabled = false;
    })
  }

  protected handleEventContractModal(isVisible: boolean) {
    if (!isVisible) {
      this.saveButtonDisabled = false;
      this.contractStatusMessage.hideAllMessages();
      this.edcStatusMessage.hideAllMessages();
      this.contractPdfDownloadMessage.hideAllMessages();
      // TODO clear contract on close again
    }
  }

  protected userIsActiveProvider(): boolean {
    return this.activeOrgRoleService.getActiveOrgaId() == this.contractDetails.details.providerId;
  }

  protected userIsActiveConsumer(): boolean {
    return this.activeOrgRoleService.getActiveOrgaId() == this.contractDetails.details.consumerId;
  }

  protected isContractInDraft(contractDetails: IContract): boolean {
    return contractDetails.details.state === 'IN_DRAFT';
  }

  protected isContractReleased(contractDetails: IContract): boolean {
    return contractDetails.details.state === 'RELEASED';
  }

  protected isContractSignedConsumer(contractDetails: IContract): boolean {
    return contractDetails.details.state === 'SIGNED_CONSUMER';
  }

  protected isContractDeleted(contractDetails: IContract): boolean {
    return contractDetails.details.state === 'DELETED';
  }

  protected isContractArchived(contractDetails: IContract): boolean {
    return contractDetails.details.state === 'ARCHIVED';
  }

  protected isDataDeliveryContract(contractDetails: IContract): boolean {
    return contractDetails.offering.selfDescription.verifiableCredential.credentialSubject['@type'] === 'merlot:MerlotServiceOfferingDataDelivery';
  }

  protected shouldShowSaveButton(contractDetails: IContract): boolean {
    return this.isContractInDraft(contractDetails) || (this.userIsActiveProvider() && this.isContractSignedConsumer(contractDetails));
  }

  protected shouldShowDeleteButton(contractDetails: IContract): boolean {
    return this.isContractInDraft(contractDetails);
  }

  protected shouldShowPurgeButton(contractDetails: IContract): boolean {
    return this.isContractDeleted(contractDetails) && this.userIsActiveProvider();
  }

  protected shouldShowOrderButton(contractDetails: IContract): boolean {
    return this.isContractInDraft(contractDetails) && this.userIsActiveConsumer();
  }

  protected shouldShowAcceptButton(contractDetails: IContract): boolean {
    return this.isContractSignedConsumer(contractDetails) && this.userIsActiveProvider()
  }

  protected shouldShowRevokeButton(contractDetails: IContract): boolean {
    return this.isDataDeliveryContract(contractDetails) && (this.isContractSignedConsumer(contractDetails) || this.isContractReleased(contractDetails));
  }

  protected shouldShowArchiveButton(contractDetails: IContract): boolean {
    return this.isContractReleased(contractDetails);
  }

  protected shouldShowRegenerateButton(contractDetails: IContract): boolean {
    return this.isContractArchived(contractDetails) || this.isContractDeleted(contractDetails);
  }

  protected hasContractPdfDownload(contract: IContract): boolean {
    return (!!contract.details.consumerSignerUser && !!contract.details.providerSignerUser);
  }

  protected downloadContractPdf(contract: IContract) {
    this.saveButtonDisabled = true;
    this.contractApiService.downloadContractPdf(this.contractDetails.details.id).then(result => {
      saveAs(result, "Vertrag_" + contract.details.id.replace("Contract:", "") + ".pdf");
      this.saveButtonDisabled = false;
    }).catch((e: HttpErrorResponse) => {
      this.contractPdfDownloadMessage.showErrorMessage(e.error.message);
      this.saveButtonDisabled = false;
    }).catch(_ => {
      this.contractPdfDownloadMessage.showErrorMessage("Unbekannter Fehler.");
      this.saveButtonDisabled = false;
    });
  }
}