import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IBasicOffering, IServiceOffering, IPageBasicOfferings } from '../serviceofferings-data'
import { ServiceofferingApiService } from '../../../services/serviceoffering-api.service'
import { OrganizationsApiService } from 'src/app/services/organizations-api.service';
import { ContractApiService } from 'src/app/services/contract-api.service';
import { ActiveOrganizationRoleService } from 'src/app/services/active-organization-role.service';
import { serviceFileNameDict } from '../serviceofferings-data';
import { BehaviorSubject, Subscription } from 'rxjs';
import { IContract } from '../../contracts/contracts-data';
import { ConnectorData } from '../../organization/organization-data';
import { OfferingWizardExtensionComponent } from 'src/app/wizard-extension/offering-wizard-extension/offering-wizard-extension.component';
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

  protected activePublicOfferingPage: BehaviorSubject<IPageBasicOfferings> = new BehaviorSubject({
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
  protected orgaConnectors: ConnectorData[] = [];

  protected initialLoading: boolean = true;

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
    if (this.activeOrgRoleService.isActiveAsRepresentative()) {
      this.activeOrgaSubscription = this.activeOrgRoleService.activeOrganizationRole.subscribe(value => {
        this.orgaConnectors = value.orgaData.metadata.connectors;
        this.refreshOrgaOfferings(0, this.ITEMS_PER_PAGE);   
    });
    }
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
    this.serviceOfferingApiService.fetchPublicServiceOfferings(page, size, this.applyStatusFilter ? this.selectedStatusFilter : undefined).then(result => {
      this.activePublicOfferingPage.next(result);
      this.initialLoading = false;
    });
  }

  protected refreshOrgaOfferings(page: number, size: number, statusFilter: string = undefined) {
    this.activeOrgaOfferingPage.next(this.emptyPage);
    if (this.activeOrgRoleService.isLoggedIn.value && this.activeOrgRoleService.isActiveAsRepresentative()) {
      this.serviceOfferingApiService.fetchOrganizationServiceOfferings(page, size, statusFilter).then(result => {
      this.activeOrgaOfferingPage.next(result);
      this.initialLoading = false;
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
    }
  }


  protected async requestDetails(id: string) {
    this.selectedOfferingDetails = null;
    await this.serviceOfferingApiService.fetchServiceOfferingDetails(id).then(result => {
      this.selectedOfferingDetails = result;
    });
  }

  releaseOffering(id: string) {
    this.serviceOfferingApiService.releaseServiceOffering(id).then(result => {
      this.refreshOfferings();
    });
  }

  revokeOffering(id: string) {
    this.serviceOfferingApiService.revokeServiceOffering(id).then(result => {
      this.refreshOfferings();
    });
  }

  inDraftOffering(id: string) {
    this.serviceOfferingApiService.inDraftServiceOffering(id).then(result => {
      this.refreshOfferings();
    });
  }
  
  deleteOffering(id: string) {
    this.serviceOfferingApiService.deleteServiceOffering(id).then(result => {
      this.refreshOfferings();
    });
  }

  purgeOffering(id: string) {
    this.serviceOfferingApiService.purgeServiceOffering(id).then(result => {
      this.refreshOfferings();
    });
  }

  regenerateOffering(id: string) {
    this.serviceOfferingApiService.regenerateServiceOffering(id).then(result => {
      this.serviceOfferingApiService.fetchServiceOfferingDetails(result["id"]).then(result => {
        this.selectedOfferingDetails = result;
      });
      this.refreshOfferings();
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
