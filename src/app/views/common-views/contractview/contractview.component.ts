/*
 *  Copyright 2024 Dataport. All rights reserved. Developed as part of the MERLOT project.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { IContract, IEdcIdResponse, IEdcNegotiationStatus, IEdcTransferStatus } from '../../contracts/contracts-data';
import { ContractApiService } from 'src/app/services/contract-api.service';
import { OrganizationsApiService } from 'src/app/services/organizations-api.service';
import { ServiceofferingApiService } from 'src/app/services/serviceoffering-api.service';
import { ActiveOrganizationRoleService } from 'src/app/services/active-organization-role.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ConnectorData } from 'src/app/views/organization/organization-data';
import { saveAs } from 'file-saver';
import { StatusMessageComponent } from '../status-message/status-message.component';
import { getMerlotDataDeliveryServiceOfferingCsFromServiceOfferingSd, getServiceOfferingIdFromServiceOfferingSd } from 'src/app/utils/credential-tools';
import { environment } from 'src/environments/environment';
import { MerlotProgressComponent } from '../merlot-progress/merlot-progress.component';
import { isContractInDraft, isContractReleased, isContractSignedConsumer, isContractDeleted, isContractArchived, isDataDeliveryContract, isSaasContract } from "../../../utils/contract-utils";


const sleep = (ms) => new Promise(r => setTimeout(r, ms));

@Component({
  selector: 'app-contractview',
  templateUrl: './contractview.component.html',
  styleUrls: ['./contractview.component.scss']
})
export class ContractviewComponent {

  @Input() contractDetails: IContract = undefined;
  @Output() buttonClickCallback: EventEmitter<any> = new EventEmitter();

  @ViewChild('contractStatusMessage') private contractStatusMessage: StatusMessageComponent;
  @ViewChild('edcStatusMessage') private edcStatusMessage: StatusMessageComponent;
  @ViewChild('edcTransferBar') private edcTransferBar: MerlotProgressComponent;
  @ViewChild('contractPdfDownloadMessage') private contractPdfDownloadMessage: StatusMessageComponent;

  protected saveButtonDisabled: boolean = false;
  protected transferBarVisible: boolean = false;
  protected waitingForResponse: boolean = false;

  private EDC_NEGOTIATION_STATES: string[] = ["INITIAL", "REQUESTING", "REQUESTED", "AGREEING", "AGREED", "VERIFYING", "VERIFIED", "FINALIZING", "FINALIZED"]
  private EDC_TRANSFER_STATES: string[] = ["INITIAL", "PROVISIONING", "PROVISIONED", "REQUESTING", "REQUESTED", "STARTING", "STARTED", "COMPLETED"]
  protected getServiceOfferingIdFromServiceOfferingSd = getServiceOfferingIdFromServiceOfferingSd;
  protected isDataDeliveryContract = isDataDeliveryContract;
  protected isSaasContract = isSaasContract;
  protected isContractReleased = isContractReleased;

  protected availableConnectors : ConnectorData[] = [];

  protected environment = environment;

  constructor(
    protected contractApiService: ContractApiService,
    private activeOrgRoleService: ActiveOrganizationRoleService,
    protected serviceOfferingApiService: ServiceofferingApiService,
    protected organizationsApiService: OrganizationsApiService) {
      this.availableConnectors = activeOrgRoleService.activeOrganizationRole.value.orgaData?.metadata?.connectors;
  }

  protected handleButtonClick(targetFunction: (contractApiService: ContractApiService, contractDetails: IContract) => Promise<IContract>, contractDetails: IContract) {
    console.log("sent", contractDetails);
    this.saveButtonDisabled = true;
    this.waitingForResponse = true;
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
        this.waitingForResponse = false;
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
    let dataDeliveryCs = getMerlotDataDeliveryServiceOfferingCsFromServiceOfferingSd(contractDetails.offering.selfDescription);
    return (dataDeliveryCs['merlot:dataTransferType'] === 'Push' && this.userIsActiveConsumer()) 
           || (dataDeliveryCs['merlot:dataTransferType'] === 'Pull' && this.userIsActiveProvider());
  }  
  protected isDataTransferButtonVisible(contractDetails: IContract) {
    return contractDetails.type === 'DataDeliveryContractTemplate' 
           && contractDetails.details.state === 'RELEASED';
  }  
  protected initiateDataTransfer(contractDetails: IContract) {
    this.saveButtonDisabled = true;
    this.transferBarVisible = true;
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

        this.edcTransferBar.setBarTextPercentPrefix("EDC-Verhandlung: ");
        while (negotiationState.state !== this.EDC_NEGOTIATION_STATES.at(-1)) {
          negotiationState = await this.contractApiService.getEdcNegotiationStatus(contractDetails.details.id, negotiationId.id);
          this.edcStatusMessage.showInfoMessage("EDC Verhandlung gestartet. Aktueller Status: " + negotiationState.state);
          console.log(negotiationState);
          let negotiationProgressPercent = Math.round(((this.EDC_NEGOTIATION_STATES.indexOf(negotiationState.state) + 1) / this.EDC_NEGOTIATION_STATES.length) * 100  / 2);
          this.edcTransferBar.setProgress(negotiationProgressPercent);
          await sleep(1000);
        }
        this.edcStatusMessage.showInfoMessage("EDC Verhandlung abgeschlossen. Starte EDC Datentransfer...");
        this.edcTransferBar.setProgress(50);
      } catch (e) {
        this.edcStatusMessage.showErrorMessage("Verhandlungsfehler: " + e.message);
        this.edcTransferBar.setFail("Verhandlungsfehler!");
        this.saveButtonDisabled = false;
      }

      this.contractApiService.initiateEdcTransfer(contractDetails.details.id, negotiationId.id).then(async (transferId: IEdcIdResponse) => {
        console.log(transferId);
        try {
          let transferState: IEdcTransferStatus = {
            id: '',
            state: ''
          }

          this.edcTransferBar.setBarTextPercentPrefix("EDC-Transfer: ");
          while (transferState.state !== this.EDC_TRANSFER_STATES.at(-1) && transferState.state !== "TERMINATED") {
            transferState = await this.contractApiService.getEdcTransferStatus(contractDetails.details.id, transferId.id);
            this.edcStatusMessage.showInfoMessage("EDC Datentransfer gestartet. Aktueller Status: " + transferState.state);
            console.log(transferState);
            let transferProgressPercent = 50 +  Math.round(((this.EDC_TRANSFER_STATES.indexOf(transferState.state) + 1) / this.EDC_TRANSFER_STATES.length) * 100  / 2);
            this.edcTransferBar.setProgress(transferProgressPercent);
            await sleep(1000);
          }
          if (transferState.state === this.EDC_TRANSFER_STATES.at(-1)) {
            this.edcTransferBar.setProgress(100);
            this.edcTransferBar.setSuccess("Erfolgreicher Transfer!");
            this.edcStatusMessage.showSuccessMessage("", 5000);
          }
          if (transferState.state === "TERMINATED") {
            this.edcTransferBar.setFail("Transferfehler!");
            this.edcStatusMessage.showErrorMessage("", 5000);
          }
        } catch (e) {
          this.edcTransferBar.setFail("Transferfehler!");
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
      this.transferBarVisible = false;
      this.contractStatusMessage.hideAllMessages();
      this.edcStatusMessage.hideAllMessages();
      this.contractPdfDownloadMessage.hideAllMessages();
      this.contractDetails = undefined;
    }
  }

  protected userIsActiveProvider(): boolean {
    return this.activeOrgRoleService.getActiveOrgaId() == this.contractDetails.details.providerId;
  }

  protected userIsActiveConsumer(): boolean {
      return this.activeOrgRoleService.getActiveOrgaId() == this.contractDetails.details.consumerId;
  }

  protected shouldShowSaveButton(contractDetails: IContract): boolean {
    return isContractInDraft(contractDetails) || (this.userIsActiveProvider() && isContractSignedConsumer(contractDetails));
  }

  protected shouldShowDeleteButton(contractDetails: IContract): boolean {
    return isContractInDraft(contractDetails);
  }

  protected shouldShowPurgeButton(contractDetails: IContract): boolean {
    return isContractDeleted(contractDetails) && this.userIsActiveProvider();
  }

  protected shouldShowOrderButton(contractDetails: IContract): boolean {
    return isContractInDraft(contractDetails) && this.userIsActiveConsumer();
  }

  protected shouldShowAcceptButton(contractDetails: IContract): boolean {
    return isContractSignedConsumer(contractDetails) && this.userIsActiveProvider()
  }

  protected shouldShowRevokeButton(contractDetails: IContract): boolean {
    return isDataDeliveryContract(contractDetails) && (isContractSignedConsumer(contractDetails) || isContractReleased(contractDetails));
  }

  protected shouldShowArchiveButton(contractDetails: IContract): boolean {
    return isContractReleased(contractDetails);
  }

  protected shouldShowRegenerateButton(contractDetails: IContract): boolean {
    return isContractArchived(contractDetails) || isContractDeleted(contractDetails);
  }

  protected hasContractPdfDownload(contract: IContract): boolean {
    return (!!contract.details.consumerSignerUserName && !!contract.details.providerSignerUserName);
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