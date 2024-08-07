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

import { Component, OnInit } from '@angular/core';
import { IContract, IContractBasic, IPageContracts } from '../contracts-data';
import { AuthService } from 'src/app/services/auth.service';
import { ActiveOrganizationRoleService } from 'src/app/services/active-organization-role.service';
import { ContractApiService } from 'src/app/services/contract-api.service';
import { BehaviorSubject } from 'rxjs';
import { ServiceofferingApiService } from 'src/app/services/serviceoffering-api.service';
import { getMerlotSpecificServiceOfferingTypeFromServiceOfferingSd, getServiceOfferingIdFromServiceOfferingSd, getServiceOfferingNameFromServiceOfferingSd } from 'src/app/utils/credential-tools';
import { environment } from 'src/environments/environment';

@Component({
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss']
})
export class ExploreComponent implements OnInit {

  protected getServiceOfferingIdFromServiceOfferingSd = getServiceOfferingIdFromServiceOfferingSd;
  protected getServiceOfferingNameFromServiceOfferingSd = getServiceOfferingNameFromServiceOfferingSd;

  readonly ITEMS_PER_PAGE = 9;

  protected emptyPage: IPageContracts = {
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
  }

  protected activePage: BehaviorSubject<IPageContracts> = new BehaviorSubject(this.emptyPage);
  
  protected contractTemplate: IContract = undefined;

  protected initialLoading: boolean = true;

  protected selectedStatusFilter: string = '';

  protected applyStatusFilter: boolean = false;

  private isCurrentlyFiltered: boolean = false;

  protected environment = environment;

  constructor(
    private serviceOfferingApiService: ServiceofferingApiService,
    protected authService: AuthService,
    protected activeOrgRoleService: ActiveOrganizationRoleService,
    protected contractApiService: ContractApiService
    ) {
      this.selectedStatusFilter = this.contractApiService.getAvailableStatusNames()[0];
  }

  ngOnInit(): void {
    this.activeOrgRoleService.activeOrganizationRole.subscribe(value => {
      this.refreshContracts(0, this.ITEMS_PER_PAGE);
    }); 
  }

  protected filterByStatus(eventTarget: EventTarget, applyFilter: boolean, status: string) {
    if (eventTarget !== undefined) {
      this.selectedStatusFilter = (eventTarget as HTMLSelectElement).value; 
    }

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
    this.initialLoading = true;
    this.activePage.next(this.emptyPage);
    this.contractApiService.getOrgaContracts(page, size, 
      this.activeOrgRoleService.getActiveOrgaId(), 
      this.applyStatusFilter ? this.selectedStatusFilter : undefined).then(result => {
        this.activePage.next(result);
        this.initialLoading = false;
      });
  }

  public buttonInContractViewClicked() {
    this.refreshContracts(this.activePage.value.pageable.pageNumber, 
      this.activePage.value.pageable.pageSize);
  }

  protected isActiveProvider(contract: IContractBasic): boolean {
    return contract.providerId === this.activeOrgRoleService.getActiveOrgaId();
  }

  protected isActiveConsumer(contract: IContractBasic): boolean {
    return contract.consumerId === this.activeOrgRoleService.getActiveOrgaId();
  }

  protected getContractTypeName(contract: IContractBasic): string {
    return this.serviceOfferingApiService.resolveFriendlyTypeName(
      getMerlotSpecificServiceOfferingTypeFromServiceOfferingSd(contract.offering.selfDescription));
  }
}
