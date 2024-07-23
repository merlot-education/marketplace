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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { IBasicOffering, IServiceOffering, IPageBasicOfferings } from '../serviceofferings-data'
import { ServiceofferingApiService } from '../../../services/serviceoffering-api.service'
import { OrganizationsApiService } from 'src/app/services/organizations-api.service';
import { ContractApiService } from 'src/app/services/contract-api.service';
import { ActiveOrganizationRoleService } from 'src/app/services/active-organization-role.service';
import { serviceFileNameDict } from '../serviceofferings-data';
import { BehaviorSubject, Subscription } from 'rxjs';
import { IContract } from '../../contracts/contracts-data';
import { SdDownloadService } from 'src/app/services/sd-download.service';
import { getServiceOfferingIdFromServiceOfferingSd, getServiceOfferingNameFromServiceOfferingSd, getServiceOfferingProviderIdFromServiceOfferingSd } from 'src/app/utils/credential-tools';
import { Router } from '@angular/router';


@Component({
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss']
})
export class ExploreComponent implements OnInit, OnDestroy {

  readonly ITEMS_PER_PAGE = 9;

  objectKeys = Object.keys;

  private activeOrgaSubscription: Subscription;

  protected getServiceOfferingIdFromServiceOfferingSd = getServiceOfferingIdFromServiceOfferingSd;
  protected getServiceOfferingNameFromServiceOfferingSd = getServiceOfferingNameFromServiceOfferingSd;
  protected waitingForResponse: boolean = false;

  private emptyPage: IPageBasicOfferings = {
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
  };

  protected activePublicOfferingPage: BehaviorSubject<IPageBasicOfferings> = new BehaviorSubject(this.emptyPage);

  protected activeOrgaOfferingPage: BehaviorSubject<IPageBasicOfferings> = new BehaviorSubject(this.emptyPage);


  protected friendlyStatusNames = {
    "IN_DRAFT": "In Bearbeitung",
    "RELEASED": "Veröffentlicht",
    "REVOKED": "Widerrufen",
    "DELETED": "Gelöscht",
    "ARCHIVED": "Archiviert"
  }

  selectedStatusFilter: string = Object.keys(this.friendlyStatusNames)[0];
  applyStatusFilter: boolean = false;

  selectedOfferingDetails: IServiceOffering = null;
  selectedOfferingPublic: boolean = false;
  protected jsonViewHidden: boolean = true;

  contractTemplate: IContract = undefined;

  protected initialLoadingPublic: boolean = true;
  protected initialLoadingOrga: boolean = true;

  private showingModal: boolean = false;

  private isCurrentlyFiltered: boolean = false;

  constructor(
    protected serviceOfferingApiService : ServiceofferingApiService,
    protected organizationsApiService: OrganizationsApiService,
    private contractApiService: ContractApiService,
    protected sdDownloadService: SdDownloadService,
    protected activeOrgRoleService: ActiveOrganizationRoleService,
    private router: Router) {
  }

  ngOnInit(): void {
    this.activeOrgRoleService.activeOrganizationRole.subscribe(role => {
      console.log("new active role:", role);
      console.log("new active orgadata:", role.orgaData);
      if (this.activeOrgRoleService.isActiveAsRepresentative()) {
          this.refreshOrgaOfferings(0, this.ITEMS_PER_PAGE);   
      }
    });
    this.refreshOfferings();
  }

  ngOnDestroy(): void {
    if (this.activeOrgaSubscription) {
      this.activeOrgaSubscription.unsubscribe();
    }
  }

  protected handleEventDetailsModal(modalVisible: boolean) {
    this.showingModal = modalVisible;
  }

  protected handleEventContractModal(modalVisible: boolean) {
    this.showingModal = modalVisible;
  }

  private refreshOfferings() {
    if (this.showingModal) {
      this.requestDetails(getServiceOfferingIdFromServiceOfferingSd(this.selectedOfferingDetails.selfDescription));
    }
    this.refreshPublicOfferings(0, this.ITEMS_PER_PAGE);
    this.refreshOrgaOfferings(0, this.ITEMS_PER_PAGE);
  }

  protected refreshPublicOfferings(page: number, size: number) {
    this.initialLoadingPublic = true;
    this.serviceOfferingApiService.fetchPublicServiceOfferings(page, size, this.applyStatusFilter ? this.selectedStatusFilter : undefined).then(result => {
      this.activePublicOfferingPage.next(result);
    }).finally(() => {
      this.initialLoadingPublic = false;
    });
  }

  protected refreshOrgaOfferings(page: number, size: number, statusFilter: string = undefined) {
    this.initialLoadingOrga = true;
    this.activeOrgaOfferingPage.next(this.emptyPage);
    if (this.activeOrgRoleService.isLoggedIn.value && this.activeOrgRoleService.isActiveAsRepresentative()) {
      this.serviceOfferingApiService.fetchOrganizationServiceOfferings(page, size, statusFilter).then(result => {
      this.activeOrgaOfferingPage.next(result);
    }).finally(() => {
      this.initialLoadingOrga = false;
    });
    }
  }

  protected filterByStatus(eventTarget: EventTarget, applyFilter: boolean) {
    if (eventTarget !== undefined) {
      this.selectedStatusFilter = (eventTarget as HTMLSelectElement).value;
    }
    // either we should apply the filter and need to refresh, or we switched the filter off and should refresh just once
    if (applyFilter) {
      this.refreshOrgaOfferings(0, this.ITEMS_PER_PAGE, this.selectedStatusFilter);
      this.isCurrentlyFiltered = true;
    } else if (this.isCurrentlyFiltered) {
      this.refreshOrgaOfferings(0, this.ITEMS_PER_PAGE);
      this.isCurrentlyFiltered = false;
      this.selectedStatusFilter= Object.keys(this.friendlyStatusNames)[0];
    }
  }


  protected async requestDetails(id: string) {
    this.selectedOfferingDetails = null;
    await this.serviceOfferingApiService.fetchServiceOfferingDetails(id).then(result => {
      this.selectedOfferingDetails = result;
    });
  }

  releaseOffering(id: string) {
    this.waitingForResponse = true;
    this.serviceOfferingApiService.releaseServiceOffering(id).then(result => {
      this.refreshOfferings();
      }).finally(() => {
      this.waitingForResponse = false;
    });
  }

  revokeOffering(id: string) {
    this.waitingForResponse = true;
    this.serviceOfferingApiService.revokeServiceOffering(id).then(result => {
      this.refreshOfferings();
    }).finally(() => {
      this.waitingForResponse = false;
    });
  }

  inDraftOffering(id: string) {
    this.waitingForResponse = true;
    this.serviceOfferingApiService.inDraftServiceOffering(id).then(result => {
      this.refreshOfferings();
    }).finally(() => {
      this.waitingForResponse = false;
    });
  }
  
  deleteOffering(id: string) {
    this.waitingForResponse = true;
    this.serviceOfferingApiService.deleteServiceOffering(id).then(result => {
      this.refreshOfferings();
    }).finally(() => {
      this.waitingForResponse = false;
    });
  }

  purgeOffering(id: string) {
    this.waitingForResponse = true;
    this.serviceOfferingApiService.purgeServiceOffering(id).then(result => {
      this.refreshOfferings();
    }).finally(() => {
      this.waitingForResponse = false;
    });
  }

  regenerateOffering(id: string) {
    this.waitingForResponse = true;
    this.serviceOfferingApiService.regenerateServiceOffering(id).then(result => {
      this.serviceOfferingApiService.fetchServiceOfferingDetails(result["id"]).then(result => {
        this.selectedOfferingDetails = result;
        this.refreshOfferings();
      }).finally(() => {
        this.waitingForResponse = false;
      });
    }).catch(_ => {
      this.waitingForResponse = false;
    });
  }

  findFilenameByShapeType(shapeType: string): string {
    for (let file in serviceFileNameDict) {
      if (serviceFileNameDict[file].type === shapeType) {
        return file;
      }
    }
    return undefined;
  }

  bookServiceOffering(offeringId: string): void {
    this.contractApiService.createNewContract(
      offeringId, 
      this.activeOrgRoleService.getActiveOrgaId())
      .then(result => {
        console.log(result)
        this.contractTemplate = result;
      });
  }

  protected shouldShowInDraftButton(isPublicOffering: boolean, offering: IServiceOffering): boolean {
    return !isPublicOffering && offering.metadata.state === 'REVOKED';
  }

  protected shouldShowReleaseButton(isPublicOffering: boolean, offering: IServiceOffering): boolean {
    return !isPublicOffering && (offering.metadata.state === 'IN_DRAFT') || (offering.metadata.state === 'REVOKED');
  }

  protected shouldShowRevokeButton(isPublicOffering: boolean, offering: IServiceOffering): boolean {
    return !isPublicOffering && offering.metadata.state === 'RELEASED';
  }

  protected shouldShowDeleteButton(isPublicOffering: boolean, offering: IServiceOffering): boolean {
    return !isPublicOffering && (offering.metadata.state === 'IN_DRAFT') || (offering.metadata.state === 'REVOKED');
  }

  protected shouldShowPurgeButton(isPublicOffering: boolean, offering: IServiceOffering): boolean {
    return !isPublicOffering && offering.metadata.state === 'DELETED';
  }

  protected shouldShowRegenerateButton(isPublicOffering: boolean, offering: IServiceOffering): boolean {
    return !isPublicOffering && ((offering.metadata.state === 'RELEASED') 
                                  || (offering.metadata.state === 'ARCHIVED') 
                                  || (offering.metadata.state === 'DELETED'));
  }

  protected shouldShowBookButton(offering: IServiceOffering): boolean {
    return this.activeOrgRoleService.isLoggedIn.value && (getServiceOfferingProviderIdFromServiceOfferingSd(offering.selfDescription) !== this.activeOrgRoleService.getActiveOrgaId())
  }

  toogleJsonView() {
    this.jsonViewHidden = !this.jsonViewHidden;
  }

  protected editOffering(offering: IBasicOffering) {
    this.router.navigate(["service-offerings/edit/", offering.id]);
  }
}
