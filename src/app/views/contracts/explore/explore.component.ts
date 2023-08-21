import { Component, OnInit } from '@angular/core';
import { IContractBasic, IContractDetailed, IPageContracts, ISaasContractDetailed } from '../contracts-data';
import { OrganizationsApiService } from 'src/app/services/organizations-api.service';
import { AuthService } from 'src/app/services/auth.service';
import { ContractApiService } from 'src/app/services/contract-api.service';
import { IOfferings } from '../../serviceofferings/serviceofferings-data';
import { ServiceofferingApiService } from 'src/app/services/serviceoffering-api.service';
import { BehaviorSubject } from 'rxjs';
import { ConnectorData } from '../../organization/organization-data';
import { throws } from 'assert';

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

  protected selectedOfferingDetails: IOfferings = {
    metadata: null,
    providerDetails: null,
    selfDescription: null
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
    offeringAttachments: [],
    serviceContractProvisioning: {
      validUntil: ''
    },
    type: ''
  };

  protected orgaConnectors: ConnectorData[] = [];

  constructor(
    protected organizationsApiService: OrganizationsApiService,
    protected authService: AuthService,
    protected contractApiService: ContractApiService,
    private serviceOfferingApiService: ServiceofferingApiService
    ) {
  }

  ngOnInit(): void {
    this.authService.activeOrganizationRole.subscribe(value => {
      this.organizationsApiService.getConnectorsOfOrganization(value.orgaData.selfDescription.verifiableCredential.credentialSubject['@id']).then(result => {
        this.orgaConnectors = result;
      });
      this.refreshContracts(0, this.ITEMS_PER_PAGE, value.orgaData.selfDescription.verifiableCredential.credentialSubject['@id']);
    }); 
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
    this.contractApiService.getOrgaContracts(page, size, activeOrgaId).then(result => {
        this.activePage.next(result);
      });
  }

  public buttonClicked() {
    this.refreshContracts(this.activePage.value.pageable.pageNumber, 
      this.activePage.value.pageable.pageSize,
      this.authService.activeOrganizationRole.value.orgaData.selfDescription.verifiableCredential.credentialSubject['@id']);
  }

}
