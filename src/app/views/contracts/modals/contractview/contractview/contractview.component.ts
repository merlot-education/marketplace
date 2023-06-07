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
    dataAccessType: '',
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
    userCountSelection: '',
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
    consumerId: ''
  };

  @Input() offeringDetails: IOfferingsDetailed = this.emptyOfferingDetails;
  @Input() contractDetails: IContractDetailed = this.emptyContractDetails;

  constructor(
    private contractApiService: ContractApiService,
    private authService: AuthService,
    protected serviceOfferingApiService: ServiceofferingApiService,
    protected organizationsApiService: OrganizationsApiService) {
  }

  protected saveContract() {
    console.log(this.contractDetails);
    this.contractApiService.updateContract(this.contractDetails).then(result => console.log(result));
  }

  protected handleEventContractModal(isVisible: boolean) {
    if (!isVisible) {
      this.offeringDetails = this.emptyOfferingDetails;
      this.contractDetails = this.emptyContractDetails;
    }
  }

  protected userIsActiveProvider(): boolean {
    return this.authService.activeOrganizationRole.value.orgaId == this.contractDetails.providerId.replace("Participant:", "");
  }

}
