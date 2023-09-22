import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IContract, IEdcIdResponse, IEdcNegotiationStatus, IEdcTransferStatus } from '../../contracts/contracts-data';
import { ContractApiService } from 'src/app/services/contract-api.service';
import { OrganizationsApiService } from 'src/app/services/organizations-api.service';
import { ServiceofferingApiService } from 'src/app/services/serviceoffering-api.service';
import { AuthService } from 'src/app/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ConnectorData } from 'src/app/views/organization/organization-data';

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

  protected saveButtonDisabled: boolean = false;

  protected showErrorMessage: boolean = false;
  protected showSuccessMessage: boolean = false;
  protected showEdcStatusMessage: boolean = false;

  protected errorDetails: string = "";
  protected edcStatusMessage: string = "";

  constructor(
    protected contractApiService: ContractApiService,
    private authService: AuthService,
    protected serviceOfferingApiService: ServiceofferingApiService,
    protected organizationsApiService: OrganizationsApiService) {
  }

  protected trackByFn(index, item) {
    return index;  
  }

  protected getConnectorBuckets(connectorId: string) {
    try {
      return this.availableConnectors.find(con => con.connectorId === connectorId).bucketNames;
    } catch (e) {
      return [];
    }
  }

  protected handleButtonClick(targetFunction: (contractApiService: ContractApiService, contractDetails: IContract) => Promise<IContract>, contractDetails: IContract) {
    console.log("sent", contractDetails);
    this.saveButtonDisabled = true;
    this.showSuccessMessage = false;
    this.showErrorMessage = false;
    this.showEdcStatusMessage = false;
    this.edcStatusMessage = "";
    this.errorDetails = "";

    targetFunction(this.contractApiService, contractDetails).then(result => {
        this.contractDetails = result;
        this.showSuccessMessage = true;
        console.log("received", result);
        this.buttonClickCallback.emit();
      })
      .catch((e: HttpErrorResponse) => {
        console.log(e);
        this.errorDetails = e.error.message;
        this.showErrorMessage = true;
      })
      .catch(e => {
        console.log(e);
        this.errorDetails = "Unbekannter Fehler.";
        this.showErrorMessage = true;
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
    this.showSuccessMessage = false;
    this.showErrorMessage = false;
    this.errorDetails = "";
    this.showEdcStatusMessage = true;
    this.edcStatusMessage = "Starte EDC Verhandlung...";
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
          this.edcStatusMessage = "EDC Verhandlung gestartet. Aktueller Status: " + negotiationState.state;
          console.log(negotiationState);
          await sleep(1000);
        }
        this.edcStatusMessage = "EDC Verhandlung abgeschlossen! Starte EDC Datentransfer..."; 
      } catch (e) {
        this.edcStatusMessage = "Fehler bei der EDC Verhandlung. (" + e.message + ")";
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
            this.edcStatusMessage = "EDC Datentransfer gestartet. Aktueller Status: " + transferState.state;
            console.log(transferState);
            await sleep(1000);
          }
          this.edcStatusMessage = "EDC Datentransfer abgeschlossen!";
        } catch (e) {
          this.edcStatusMessage = "Fehler beim EDC Dateitransfer. (" + e.message + ")";
        }
        
        this.saveButtonDisabled = false;
      })
    }).catch((e: HttpErrorResponse) => {
      this.edcStatusMessage = "Fehler bei der EDC Kommunikation. (" + e.error.message + ")";
      this.saveButtonDisabled = false;
    }).catch(e => {
      this.edcStatusMessage = "Fehler bei der EDC Kommunikation. (Unbekannter Fehler)";
      this.saveButtonDisabled = false;
    })
  }

  protected handleEventContractModal(isVisible: boolean) {
    if (!isVisible) {
      this.saveButtonDisabled = false;
      this.showErrorMessage = false;
      this.showSuccessMessage = false;
      this.showEdcStatusMessage = false;
      // TODO clear contract on close again
    }
  }

  protected userIsActiveProvider(): boolean {
    return this.authService.getActiveOrgaId() == this.contractDetails.details.providerId;
  }

  protected userIsActiveConsumer(): boolean {
    return this.authService.getActiveOrgaId() == this.contractDetails.details.consumerId;
  }

  protected addAttachment() {
    this.contractDetails.negotiation.attachments.push("");
  }

  protected deleteAttachment(index: number) {
    this.contractDetails.negotiation.attachments.splice(index, 1);
  }

}
