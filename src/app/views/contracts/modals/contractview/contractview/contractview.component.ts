import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { IContractDetailed } from '../../../contracts-data';
import { IOfferingsDetailed } from 'src/app/views/serviceofferings/serviceofferings-data';
import { ContractApiService } from 'src/app/services/contract-api.service';
import { OrganizationsApiService } from 'src/app/services/organizations-api.service';
import { ServiceofferingApiService } from 'src/app/services/serviceoffering-api.service';
import { AuthService } from 'src/app/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-contractview',
  templateUrl: './contractview.component.html',
  styleUrls: ['./contractview.component.scss']
})
export class ContractviewComponent {

  private emptyOfferingDetails: IOfferingsDetailed = {
    description: '',
    modifiedDate: '',
    exampleCosts: '',
    attachments: [],
    termsAndConditions: [],
    runtimeOption: [],
    id: '',
    sdHash: '',
    creationDate: '',
    offeredBy: '',
    merlotState: '',
    type: '',
    name: ''
  };

  private emptyContractDetails: IContractDetailed = {
    consumerMerlotTncAccepted: false,
    providerMerlotTncAccepted: false,
    consumerOfferingTncAccepted: false,
    consumerProviderTncAccepted: false,
    providerTncUrl: '',
    id: '',
    state: '',
    creationDate: '',
    offeringId: '',
    offeringName: '',
    providerId: '',
    consumerId: '',
    offeringAttachments: [],
    serviceContractProvisioning: {
      validUntil: ''
    }
  };

  @Input() offeringDetails: IOfferingsDetailed = this.emptyOfferingDetails;
  @Input() contractDetails: IContractDetailed = this.emptyContractDetails;
  @Output() buttonClickCallback: EventEmitter<any> = new EventEmitter();

  protected saveButtonDisabled: boolean = false;

  protected showErrorMessage: boolean = false;
  protected showSuccessMessage: boolean = false;

  protected errorDetails: string = "";

  constructor(
    protected contractApiService: ContractApiService,
    private authService: AuthService,
    protected serviceOfferingApiService: ServiceofferingApiService,
    protected organizationsApiService: OrganizationsApiService) {
  }

  protected trackByFn(index, item) {
    return index;  
  }

  protected handleButtonClick(targetFunction: (contractApiService: ContractApiService, contractDetails: IContractDetailed) => Promise<IContractDetailed>, contractDetails: IContractDetailed) {
    console.log(contractDetails);
    this.saveButtonDisabled = true;
    this.showSuccessMessage = false;
    this.showErrorMessage = false;
    this.errorDetails = "";

    targetFunction(this.contractApiService, contractDetails)
      .then(result => {
        this.contractDetails = result;
        this.showSuccessMessage = true;
        console.log(result);
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

  protected async saveContract(contractApiService: ContractApiService, contractDetails: IContractDetailed): Promise<IContractDetailed> {
    return await contractApiService.updateContract(contractDetails);
  }

  protected async deleteContract(contractApiService: ContractApiService, contractDetails: IContractDetailed): Promise<IContractDetailed> {
    return await contractApiService.statusShiftContract(contractDetails.id, 'DELETED');
  }

  protected async purgeContract(contractApiService: ContractApiService, contractDetails: IContractDetailed): Promise<IContractDetailed> {
    return await contractApiService.statusShiftContract(contractDetails.id, 'PURGED');
  }

  protected async orderContract(contractApiService: ContractApiService, contractDetails: IContractDetailed): Promise<IContractDetailed> {
    return await contractApiService.updateContract(contractDetails).then(result =>  
      contractApiService.statusShiftContract(contractDetails.id, 'SIGNED_CONSUMER'));
  }

  protected async acceptOrderContract(contractApiService: ContractApiService, contractDetails: IContractDetailed): Promise<IContractDetailed> {
    return await contractApiService.updateContract(contractDetails).then(result =>  
      contractApiService.statusShiftContract(contractDetails.id, 'RELEASED'));
  }

  protected async revokeContract(contractApiService: ContractApiService, contractDetails: IContractDetailed): Promise<IContractDetailed> {
    return await contractApiService.statusShiftContract(contractDetails.id, 'REVOKED');
  }

  protected async archiveContract(contractApiService: ContractApiService, contractDetails: IContractDetailed): Promise<IContractDetailed> {
    return await contractApiService.statusShiftContract(contractDetails.id, 'ARCHIVED');
  }

  protected handleEventContractModal(isVisible: boolean) {
    if (!isVisible) {
      this.saveButtonDisabled = false;
      this.showErrorMessage = false;
      this.showSuccessMessage = false;
    }
  }

  protected userIsActiveProvider(): boolean {
    return this.authService.activeOrganizationRole.value.orgaId == this.contractDetails.providerId.replace("Participant:", "");
  }

  protected userIsActiveConsumer(): boolean {
    return this.authService.activeOrganizationRole.value.orgaId == this.contractDetails.consumerId.replace("Participant:", "");
  }

  protected addAttachment() {
    this.contractDetails.offeringAttachments.push("");
  }

  protected deleteAttachment(index: number) {
    this.contractDetails.offeringAttachments.splice(index, 1);
  }

}
