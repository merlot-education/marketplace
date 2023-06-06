import { Component, OnInit } from '@angular/core';
import { demoContracts, IContractBasic, IContractDetailed } from '../contracts-data';
import { OrganizationsApiService } from 'src/app/services/organizations-api.service';
import { AuthService } from 'src/app/services/auth.service';
import { ContractApiService } from 'src/app/services/contract-api.service';
import { IOfferingsDetailed } from '../../serviceofferings/serviceofferings-data';
import { ServiceofferingApiService } from 'src/app/services/serviceoffering-api.service';

@Component({
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss']
})
export class ExploreComponent implements OnInit {

  contracts: IContractBasic[] = [];

  protected selectedOfferingDetails: IOfferingsDetailed = {
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
  protected contractTemplate: IContractDetailed = {
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

  constructor(
    protected organizationsApiService: OrganizationsApiService,
    protected authService: AuthService,
    protected contractApiService: ContractApiService,
    private serviceOfferingApiService: ServiceofferingApiService
    ) {
  }

  ngOnInit(): void {
    this.authService.activeOrganizationRole.subscribe(value => {
      this.contractApiService.getOrgaContracts(
        "Participant:" + value.orgaId)
        .then(result => this.contracts = result.content);
    })
  }

  prepareEditContract(contract: IContractBasic) {
    this.serviceOfferingApiService.fetchServiceOfferingDetails(contract.offeringId).then(result => {
      this.selectedOfferingDetails = result;
    })
    this.contractApiService.getContractDetails(contract.id).then(result => {
      this.contractTemplate = result;
    })
  }

}
