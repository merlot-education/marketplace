import { Component, OnInit } from '@angular/core';
import { IContract, IContractBasic, IPageContracts } from '../contracts-data';
import { OrganizationsApiService } from 'src/app/services/organizations-api.service';
import { AuthService } from 'src/app/services/auth.service';
import { ContractApiService } from 'src/app/services/contract-api.service';
import { BehaviorSubject } from 'rxjs';
import { ConnectorData } from '../../organization/organization-data';

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
  
  protected contractTemplate: IContract = undefined;

  protected orgaConnectors: ConnectorData[] = [];

  protected initialLoading: boolean = true;

  protected selectedStatusFilter: string = '';

  protected applyStatusFilter: boolean = false;

  private isCurrentlyFiltered: boolean = false;

  constructor(
    protected organizationsApiService: OrganizationsApiService,
    protected authService: AuthService,
    protected contractApiService: ContractApiService
    ) {
      this.selectedStatusFilter = this.contractApiService.getAvailableStatusNames()[0];
  }

  ngOnInit(): void {
    this.authService.activeOrganizationRole.subscribe(value => {
      this.organizationsApiService.getConnectorsOfOrganization(value.orgaData.selfDescription.verifiableCredential.credentialSubject['@id']).then(result => {
        this.orgaConnectors = result;
      });
      this.refreshContracts(0, this.ITEMS_PER_PAGE);
    }); 
  }

  protected filterByStatus(applyFilter: boolean, status: string) {
    if (applyFilter) { // if filter has been enabled, send the selected status to the api
      this.refreshContracts(0, this.ITEMS_PER_PAGE);
      this.isCurrentlyFiltered = true;
    } else if (this.isCurrentlyFiltered) { // if filter has been disabled, query once without filter and ignore further changes of dropdown
      this.refreshContracts(0, this.ITEMS_PER_PAGE);
      this.isCurrentlyFiltered = false;
    }
  }

  prepareEditContract(contract: IContractBasic) {
    this.contractApiService.getContractDetails(contract.id).then(result => {
      this.contractTemplate = result;
    })
  }

  protected refreshContracts(page: number, size: number) {
    this.contractApiService.getOrgaContracts(page, size, 
      this.authService.getActiveOrgaId(), 
      this.applyStatusFilter ? this.selectedStatusFilter : undefined).then(result => {
        this.activePage.next(result);
        this.initialLoading = false;
      });
  }

  public buttonClicked() {
    this.refreshContracts(this.activePage.value.pageable.pageNumber, 
      this.activePage.value.pageable.pageSize);
  }

  protected isActiveProvider(contract: IContractBasic): boolean {
    return contract.providerId === this.authService.getActiveOrgaId();
  }

  protected isActiveConsumer(contract: IContractBasic): boolean {
    return contract.consumerId === this.authService.getActiveOrgaId();
  }
}
