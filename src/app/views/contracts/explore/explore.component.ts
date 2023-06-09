import { Component, OnInit } from '@angular/core';
import { demoContracts, IContractBasic, IContractDetailed, IPageContracts, ISaasContractDetailed } from '../contracts-data';
import { OrganizationsApiService } from 'src/app/services/organizations-api.service';
import { AuthService } from 'src/app/services/auth.service';
import { ContractApiService } from 'src/app/services/contract-api.service';
import { IOfferingsDetailed } from '../../serviceofferings/serviceofferings-data';
import { ServiceofferingApiService } from 'src/app/services/serviceoffering-api.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss']
})
export class ExploreComponent implements OnInit {

  readonly ITEMS_PER_PAGE = 9;

  activePage: BehaviorSubject<IPageContracts> = new BehaviorSubject({
    content: [],
    empty: false,
    first: false,
    last: false,
    number: 0,
    numberOfElements: 0,
    pageable: {
      offset: 0,
      pageNumber: 0,
      pageSize: 0,
      paged: false,
      sort: {
        empty: false,
        sorted: false,
        unsorted: false
      },
      unpaged: false
    },
    size: 0,
    totalElements: 0,
    totalPages: 0
  });

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

  constructor(
    protected organizationsApiService: OrganizationsApiService,
    protected authService: AuthService,
    protected contractApiService: ContractApiService,
    private serviceOfferingApiService: ServiceofferingApiService
    ) {
  }

  ngOnInit(): void {
    this.authService.activeOrganizationRole.subscribe(value => {
      this.refreshContracts(0, this.ITEMS_PER_PAGE, value.orgaId);
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

  protected refreshContracts(page: number, size: number, activeOrgaId: string) {
    this.contractApiService.getOrgaContracts(page, size, "Participant:" + activeOrgaId).then(result => {
        this.activePage.next(result);
      });
  }

}
