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

import { Component, Input, ViewChild } from '@angular/core';
import { IContract, IDataDeliveryContract, ISaasContract } from '../../../../contracts/contracts-data';
import { ContractApiService } from 'src/app/services/contract-api.service';
import { ActiveOrganizationRoleService } from 'src/app/services/active-organization-role.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ConnectorData } from 'src/app/views/organization/organization-data';
import { IOfferingRuntime } from '../../../../serviceofferings/serviceofferings-data';
import { saveAs } from 'file-saver';
import { StatusMessageComponent } from '../../../status-message/status-message.component';
import { asMerlotCoopContractServiceOfferingCs, asMerlotDataDeliveryServiceOfferingCs, asMerlotSaasServiceOfferingCs, asMerlotServiceOfferingCs, isMerlotCoopContractServiceOfferingCs, isMerlotDataDeliveryServiceOfferingCs, isMerlotSaasServiceOfferingCs, isMerlotServiceOfferingCs } from 'src/app/utils/credential-tools';
import { isContractInDraft, isDataDeliveryContract, isSaasContract } from "src/app/utils/contract-utils";


@Component({
  selector: 'app-common-contract-config',
  templateUrl: './common-contract-config.component.html',
  styleUrls: ['./common-contract-config.component.scss']
})
export class CommonContractConfigComponent {
  protected asDataDeliveryContract(val): IDataDeliveryContract { return val };
  protected asSaasContract(val): ISaasContract { return val };
  protected isMerlotServiceOfferingCs = isMerlotServiceOfferingCs;
  protected asMerlotServiceOfferingCs = asMerlotServiceOfferingCs;
  protected isMerlotSaasServiceOfferingCs = isMerlotSaasServiceOfferingCs;
  protected asMerlotSaasServiceOfferingCs = asMerlotSaasServiceOfferingCs;
  protected isMerlotDataDeliveryServiceOfferingCs = isMerlotDataDeliveryServiceOfferingCs;
  protected asMerlotDataDeliveryServiceOfferingCs = asMerlotDataDeliveryServiceOfferingCs;
  protected isMerlotCoopContractServiceOfferingCs = isMerlotCoopContractServiceOfferingCs;
  protected asMerlotCoopContractServiceOfferingCs = asMerlotCoopContractServiceOfferingCs;
  protected isContractInDraft = isContractInDraft;
  protected isSaasContract = isSaasContract;
  protected isDataDeliveryContract = isDataDeliveryContract;

  @Input() contractDetails: IContract = undefined;
  @Input() availableConnectors : ConnectorData[] = [];

  @ViewChild('attachmentStatusMessage') private attachmentStatusMessage: StatusMessageComponent;

  protected attachmentAddButtonDisabled: boolean = false;

  constructor(
    protected contractApiService: ContractApiService,
    private activeOrgRoleService: ActiveOrganizationRoleService) {
  }

  protected trackByFn(index, item) {
    return index;  
  }

  protected userIsActiveProvider(): boolean {
    return this.activeOrgRoleService.getActiveOrgaId() == this.contractDetails.details.providerId;
  }

  protected userIsActiveConsumer(): boolean {
    return this.activeOrgRoleService.getActiveOrgaId() == this.contractDetails.details.consumerId;
  }

  protected shouldShowAttachments(contractDetails: IContract): boolean {
    return this.userIsActiveProvider() && isContractInDraft(contractDetails) || (contractDetails.negotiation.attachments.length > 0);
  }

  protected canAddAttachments(contractDetails: IContract): boolean {
    return this.userIsActiveProvider() && isContractInDraft(contractDetails) && (contractDetails.negotiation.attachments.length <= 10);
  }

  protected shouldShowAttachmentAsLink(contractDetails: IContract): boolean {
    return this.userIsActiveConsumer() || !isContractInDraft(contractDetails);
  }

  protected shouldShowAttachmentAsTextbox(contractDetails: IContract): boolean {
    return this.userIsActiveProvider() && isContractInDraft(contractDetails);
  }

  protected isRuntimeUnlimited(runtime: IOfferingRuntime): boolean {
    return runtime['merlot:runtimeCount'] === 0 || runtime['merlot:runtimeMeasurement'] === 'unlimited'
  }
  
  protected addAttachment(event: Event) {

    this.attachmentAddButtonDisabled = true;

    const file:File = (event.target as HTMLInputElement).files[0];
    if (!file) {
      this.attachmentAddButtonDisabled = false;
      return;
    }

    (event.target as HTMLInputElement).value = null;

    let fileName = file.name;
    const formData = new FormData();
    formData.append("file", file);

    if (file.type !== 'application/pdf') {
      console.log("not pdf");
      this.attachmentStatusMessage.showErrorMessage("Ausgewählte Datei ist keine PDF.", 5000);
      this.attachmentAddButtonDisabled = false;
      return;
    }

    if (file.size > 2 * 1000 * 1000) { // size is in bytes
      console.log("file too large");
      this.attachmentStatusMessage.showErrorMessage("Ausgewählte Datei ist zu groß, max. 2 MB erlaubt.", 5000);
      this.attachmentAddButtonDisabled = false;
      return;
    }

    this.attachmentStatusMessage.showInfoMessage("Anhang wird hochgeladen...");

    this.contractApiService.addAttachment(this.contractDetails.details.id, formData).then(result => {
      this.contractDetails = result;
      this.attachmentStatusMessage.showSuccessMessage(fileName + " wurde hochgeladen.", 5000);
      this.attachmentAddButtonDisabled = false;
    }).catch((e: HttpErrorResponse) => {
      this.attachmentStatusMessage.showErrorMessage(e.error.message);
      this.attachmentAddButtonDisabled = false;
    });
  }

  protected deleteAttachment(attachmentName: string) {
    this.attachmentAddButtonDisabled = true;
    this.attachmentStatusMessage.showInfoMessage("Anhang wird gelöscht...");
    this.contractApiService.deleteAttachment(this.contractDetails.details.id, attachmentName).then(result => {
      this.contractDetails = result;
      this.attachmentStatusMessage.showSuccessMessage(attachmentName + " wurde gelöscht.", 5000);
      this.attachmentAddButtonDisabled = false;
    }).catch((e: HttpErrorResponse) => {
      this.attachmentStatusMessage.showErrorMessage(e.error.message);
      this.attachmentAddButtonDisabled = false;
    });
  }

  protected downloadAttachment(attachmentName: string) {
    this.attachmentStatusMessage.hideAllMessages();
    this.contractApiService.downloadAttachment(this.contractDetails.details.id, attachmentName).then(result => {
      saveAs(result, attachmentName);
    });
  }

}
