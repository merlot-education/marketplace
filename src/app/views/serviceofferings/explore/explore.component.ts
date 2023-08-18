import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {IOfferings, IOfferingsDetailed, IPageOfferings} from '../serviceofferings-data'
import { ServiceofferingApiService } from '../../../services/serviceoffering-api.service'
import { OrganizationsApiService } from 'src/app/services/organizations-api.service';
import { ContractApiService } from 'src/app/services/contract-api.service';
import { AuthService } from 'src/app/services/auth.service';
import { ShaclFile } from '@models/shacl-file';
import { FormfieldControlService } from '@services/form-field.service';
import { Shape } from '@models/shape';
import { serviceFileNameDict } from '../serviceofferings-data';
import { DynamicFormComponent } from 'src/app/sdwizard/core/dynamic-form/dynamic-form.component';
import { BehaviorSubject, Subscription } from 'rxjs';
import { IContractDetailed } from '../../contracts/contracts-data';
import { ConnectorData } from '../../organization/organization-data';

interface IPageOption {
  target: number;
  text: string;
  disabled: boolean;
  active: boolean;
}

@Component({
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss']
})
export class ExploreComponent implements OnInit, OnDestroy {

  @ViewChild(DynamicFormComponent, {static: false}) childRef: DynamicFormComponent;

  readonly ITEMS_PER_PAGE = 9;

  objectKeys = Object.keys;

  private activeOrgaSubscription: Subscription;

  private editModalPreviouslyVisible = false;

  shaclFile: ShaclFile = undefined;
  filteredShapes: Shape[];

  protected activePublicOfferingPage: BehaviorSubject<IPageOfferings> = new BehaviorSubject({
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

  protected activeOrgaOfferingPage: BehaviorSubject<IPageOfferings> = new BehaviorSubject({
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


  protected friendlyStatusNames = {
    "IN_DRAFT": "In Bearbeitung",
    "RELEASED": "Veröffentlicht",
    "REVOKED": "Widerrufen",
    "DELETED": "Gelöscht",
    "ARCHIVED": "Archiviert"
  }

  selectedStatusFilter: string = Object.keys(this.friendlyStatusNames)[0];
  applyStatusFilter: boolean = false;
  emptyOfferingDetails: IOfferingsDetailed = {
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

  emptyContractTemplate: IContractDetailed = {
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
  }

  selectedOfferingDetails: IOfferingsDetailed = this.emptyOfferingDetails;
  selectedOfferingPublic: boolean = false;

  contractTemplate: IContractDetailed = this.emptyContractTemplate;
  protected orgaConnectors: ConnectorData[] = [];

  private showingModal: boolean = false;

  private isFiltered: boolean = false;

  constructor(
    protected serviceOfferingApiService : ServiceofferingApiService,
    protected organizationsApiService: OrganizationsApiService,
    private contractApiService: ContractApiService,
    protected authService: AuthService,
    private formFieldService: FormfieldControlService) {
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn) {
      this.activeOrgaSubscription = this.authService.activeOrganizationRole.subscribe(value => {
        this.organizationsApiService.getConnectorsOfOrganization(value.orgaData.selfDescription.verifiableCredential.credentialSubject['@id']).then(result => {
        this.orgaConnectors = result;
        this.refreshOrgaOfferings(0, this.ITEMS_PER_PAGE);
      });
    });
    }
    this.refreshOfferings();
  }

  ngOnDestroy(): void {
    this.activeOrgaSubscription.unsubscribe();
  }

  protected handleEventEditModal(modalVisible: boolean) {
    this.showingModal = modalVisible;
    if (this.editModalPreviouslyVisible && !modalVisible) {
      this.childRef.ngOnDestroy();
      this.refreshOfferings();
    }
    this.editModalPreviouslyVisible = modalVisible;
  }

  protected handleEventDetailsModal(modalVisible: boolean) {
    this.showingModal = modalVisible;
  }

  protected handleEventContractModal(modalVisible: boolean) {
    this.showingModal = modalVisible;
  }

  private refreshOfferings() {
    if (this.showingModal) {
      this.requestDetails(this.selectedOfferingDetails.id);
    }
    this.refreshPublicOfferings(0, this.ITEMS_PER_PAGE);
    this.refreshOrgaOfferings(0, this.ITEMS_PER_PAGE);
  }

  protected refreshPublicOfferings(page: number, size: number) {
    this.serviceOfferingApiService.fetchPublicServiceOfferings(page, size, this.applyStatusFilter ? this.selectedStatusFilter : undefined).then(result => {
      this.activePublicOfferingPage.next(result);
    });
  }

  private refreshOrgaOfferings(page: number, size: number) {
    if (this.authService.isLoggedIn) {
      this.serviceOfferingApiService.fetchOrganizationServiceOfferings(page, size, this.applyStatusFilter ? this.selectedStatusFilter : undefined).then(result => {
      this.activeOrgaOfferingPage.next(result);
    });
    }
  }

  protected filterByStatus(applyFilter: boolean, status: string) {
    // either we should apply the filter and need to refresh, or we switched the filter off and should refresh just once
    if (applyFilter) {
      this.refreshOrgaOfferings(0, this.ITEMS_PER_PAGE);
      this.isFiltered = true;
    } else if (this.isFiltered) {
      this.refreshOrgaOfferings(0, this.ITEMS_PER_PAGE);
      this.isFiltered = false;
    }
  }


  protected async requestDetails(id: string) {
    this.selectedOfferingDetails = this.emptyOfferingDetails;
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
      // prepare new id for refreshing
      this.selectedOfferingDetails.id = result["id"];
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

  updateServiceOfferingEdit(offering: IOfferings) {
    this.requestDetails(offering.id).then(() => {
      this.select(this.findFilenameByShapeType(offering.type));
    });
    
  }

  select(name: string): void {
    this.serviceOfferingApiService.fetchShape(name).then(
      res => {
        this.shaclFile = this.formFieldService.readShaclFile(res);
        this.filteredShapes = this.formFieldService.updateFilteredShapes(this.shaclFile);
        if (this.filteredShapes.length > 1) {
          console.log("too many shapes selected");
        }
        else {
          console.log("this here"+this.shaclFile);
          console.table(this.shaclFile);
          //set description.input value depending on language
          this.updateSelectedShape();
          //this.router.navigate(['/service-offerings/edit/form'], { state: { file: this.shaclFile } });
        }
      }
    );
  }

  updateSelectedShape(): void {
    const shape = this.filteredShapes[0];
    if (shape !== undefined) {
      this.shaclFile.shapes.find(x => x.name === shape.name).selected = true;
    }
  }

  bookServiceOffering(offeringId: string): void {
    this.contractApiService.createNewContract(
      offeringId, 
      this.authService.activeOrganizationRole.value.orgaData.selfDescription.verifiableCredential.credentialSubject['@id'])
      .then(result => {
        console.log(result)
        this.contractTemplate = result;
      });
  }
}
