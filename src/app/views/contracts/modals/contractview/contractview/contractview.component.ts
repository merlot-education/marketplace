import { Component, Input, Output, ViewChild } from '@angular/core';
import { IContractDetailed } from '../../../contracts-data';
import { IOfferingsDetailed } from 'src/app/views/serviceofferings/serviceofferings-data';
import { ContractApiService } from 'src/app/services/contract-api.service';
import { OrganizationsApiService } from 'src/app/services/organizations-api.service';
import { ServiceofferingApiService } from 'src/app/services/serviceoffering-api.service';
import { AuthService } from 'src/app/services/auth.service';

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
    offeringAttachments: []
  };

  @Input() offeringDetails: IOfferingsDetailed = this.emptyOfferingDetails;
  @Input() contractDetails: IContractDetailed = this.emptyContractDetails;

  protected saveButtonDisabled: boolean = false;
  protected deleteButtonDisabled: boolean = false;
  protected orderButtonDisabled: boolean = false;
  protected acceptOrderButtonDisabled: boolean = false;
  protected revokeButtonDisabled: boolean = false;
  protected archiveButtonDisabled: boolean = false;


  protected showErrorMessage: boolean = false;
  protected showSuccessMessage: boolean = false;

  constructor(
    protected contractApiService: ContractApiService,
    private authService: AuthService,
    protected serviceOfferingApiService: ServiceofferingApiService,
    protected organizationsApiService: OrganizationsApiService) {
  }

  protected trackByFn(index, item) {
    return index;  
  }

  protected saveContract() {
    console.log(this.contractDetails);
    this.saveButtonDisabled = true;
    this.showSuccessMessage = false;
    this.showErrorMessage = false;
    try {
      this.contractApiService.updateContract(this.contractDetails).then(result =>  {
        this.contractDetails = result;
        this.showSuccessMessage = true;
        this.saveButtonDisabled = false;
        console.log(result)
      });
    } catch (e){
      console.log(e);
      this.showErrorMessage = true;
    }
    
  }

  protected deleteContract() {
    try {
      this.contractApiService.statusShiftContract(this.contractDetails.id, 'DELETED').then(result =>  {
        //this.contractDetails = result;
        console.log(result)
      });
    } catch (e){
      console.log(e);
      this.showErrorMessage = true;
    }
  }

  protected orderContract() {
    try {
      this.contractApiService.statusShiftContract(this.contractDetails.id, 'SIGNED_CONSUMER').then(result =>  {
        //this.contractDetails = result;
        console.log(result)
      });
    } catch (e){
      console.log(e);
      this.showErrorMessage = true;
    }   
  }

  protected acceptOrderContract() {
    try {
      this.contractApiService.statusShiftContract(this.contractDetails.id, 'RELEASED').then(result =>  {
        //this.contractDetails = result;
        console.log(result)
      });
    } catch (e){
      console.log(e);
      this.showErrorMessage = true;
    }   
  }

  protected revokeContract() {
    try {
      this.contractApiService.statusShiftContract(this.contractDetails.id, 'REVOKED').then(result =>  {
        //this.contractDetails = result;
        console.log(result)
      });
    } catch (e){
      console.log(e);
      this.showErrorMessage = true;
    }       
  }

  protected archiveContract() {
    try {
      this.contractApiService.statusShiftContract(this.contractDetails.id, 'ARCHIVED').then(result =>  {
        //this.contractDetails = result;
        console.log(result)
      });
    } catch (e){
      console.log(e);
      this.showErrorMessage = true;
    }    
  }

  protected handleEventContractModal(isVisible: boolean) {
    if (!isVisible) {
      this.offeringDetails = this.emptyOfferingDetails;
      this.contractDetails = this.emptyContractDetails;
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
