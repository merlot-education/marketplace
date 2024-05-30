import { Component, Input, ViewChild } from '@angular/core';
import { IContract, IDataDeliveryContract, ISaasContract } from '../../../../contracts/contracts-data';
import { ContractApiService } from 'src/app/services/contract-api.service';
import { ActiveOrganizationRoleService } from 'src/app/services/active-organization-role.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ConnectorData } from 'src/app/views/organization/organization-data';
import { IOfferingRuntime } from '../../../../serviceofferings/serviceofferings-data';
import { saveAs } from 'file-saver';
import { StatusMessageComponent } from '../../../status-message/status-message.component';

@Component({
  selector: 'app-common-contract-config',
  templateUrl: './common-contract-config.component.html',
  styleUrls: ['./common-contract-config.component.scss']
})
export class CommonContractConfigComponent {
  protected asDataDeliveryContract(val): IDataDeliveryContract { return val };
  protected asSaasContract(val): ISaasContract { return val };

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

  protected shouldShowAttachments(contractDetails: IContract): boolean {
    return this.userIsActiveProvider() && this.isContractInDraft(contractDetails) || (contractDetails.negotiation.attachments.length > 0);
  }

  protected canAddAttachments(contractDetails: IContract): boolean {
    return this.userIsActiveProvider() && this.isContractInDraft(contractDetails) && (contractDetails.negotiation.attachments.length <= 10);
  }

  protected shouldShowAttachmentAsLink(contractDetails: IContract): boolean {
    return this.userIsActiveConsumer() || !this.isContractInDraft(contractDetails);
  }

  protected shouldShowAttachmentAsTextbox(contractDetails: IContract): boolean {
    return this.userIsActiveProvider() && this.isContractInDraft(contractDetails);
  }

  protected isRuntimeUnlimited(runtime: IOfferingRuntime): boolean {
    return runtime['merlot:runtimeCount']['@value'] === 0 || runtime['merlot:runtimeMeasurement']['@value'] === 'unlimited'
  }

  protected isSaasContract(contractDetails: IContract): boolean {
    return false; // TODO
    //contractDetails.offering.selfDescription.verifiableCredential.credentialSubject.type === 'merlot:MerlotServiceOfferingSaaS';
  }

  protected isDataDeliveryContract(contractDetails: IContract): boolean {
    return false; // TODO
    //contractDetails.offering.selfDescription.verifiableCredential.credentialSubject.type === 'merlot:MerlotServiceOfferingDataDelivery';
  }

  protected hasContractAttachments(contractDetails: IContract): boolean {
    return contractDetails.negotiation.attachments.length > 0;
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
