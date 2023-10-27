import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IBasicOffering, IOfferings, IPageBasicOfferings, ITermsAndConditions } from '../serviceofferings-data'
import { ServiceofferingApiService } from '../../../services/serviceoffering-api.service'
import { WizardExtensionService } from '../../../services/wizard-extension.service'
import { OrganizationsApiService } from 'src/app/services/organizations-api.service';
import { ContractApiService } from 'src/app/services/contract-api.service';
import { AuthService } from 'src/app/services/auth.service';
import { ShaclFile } from '@models/shacl-file';
import { FormfieldControlService } from '@services/form-field.service';
import { Shape } from '@models/shape';
import { serviceFileNameDict } from '../serviceofferings-data';
import { DynamicFormComponent } from 'src/app/sdwizard/core/dynamic-form/dynamic-form.component';
import { BehaviorSubject, Subscription } from 'rxjs';
import { IContract } from '../../contracts/contracts-data';
import { ConnectorData } from '../../organization/organization-data';


@Component({
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss']
})
export class ExploreComponent implements OnInit, OnDestroy {
  @ViewChild("wizard") private wizard: DynamicFormComponent;

  readonly ITEMS_PER_PAGE = 9;

  objectKeys = Object.keys;

  private activeOrgaSubscription: Subscription;

  private editModalPreviouslyVisible = false;

  shaclFile: ShaclFile;
  filteredShapes: Shape[];

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

  protected activeOrgaOfferingPage: BehaviorSubject<IPageBasicOfferings> = new BehaviorSubject({
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

  selectedOfferingDetails: IOfferings = null;
  selectedOfferingPublic: boolean = false;

  contractTemplate: IContract = undefined;
  protected orgaConnectors: ConnectorData[] = [];

  protected initialLoading: boolean = true;

  private showingModal: boolean = false;

  private isCurrentlyFiltered: boolean = false;

  constructor(
    protected serviceOfferingApiService : ServiceofferingApiService,
    protected organizationsApiService: OrganizationsApiService,
    private contractApiService: ContractApiService,
    protected authService: AuthService,
    private formFieldService: FormfieldControlService,
    private wizardExtensionService: WizardExtensionService) {
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
      this.wizard.ngOnDestroy();
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
      this.requestDetails(this.selectedOfferingDetails.selfDescription.verifiableCredential.credentialSubject['@id']);
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
    if (this.authService.isLoggedIn) {
      this.serviceOfferingApiService.fetchOrganizationServiceOfferings(page, size, statusFilter).then(result => {
      this.activeOrgaOfferingPage.next(result);
      this.initialLoading = false;
    });
    }
  }

  protected filterByStatus(eventTarget: EventTarget, applyFilter: boolean, status: string) {
    if (eventTarget !== undefined) {
      this.selectedStatusFilter = (eventTarget as HTMLSelectElement).value;
    }
    // either we should apply the filter and need to refresh, or we switched the filter off and should refresh just once
    if (applyFilter) {
      this.refreshOrgaOfferings(0, this.ITEMS_PER_PAGE, status);
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
      // prepare new id for refreshing
      this.selectedOfferingDetails.selfDescription.verifiableCredential.credentialSubject['@id'] = result["id"];
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

  updateServiceOfferingEdit(offering: IBasicOffering) {
    this.requestDetails(offering.id).then(() => {
      this.select(this.findFilenameByShapeType(offering.type));
      let merlotTnC = this.organizationsApiService.getMerlotFederationOrga().selfDescription.verifiableCredential.credentialSubject['merlot:termsAndConditions'];
      let providerTnC: ITermsAndConditions = this.authService.activeOrganizationRole.value.orgaData.selfDescription.verifiableCredential.credentialSubject['merlot:termsAndConditions'];

      for (let tnc of this.selectedOfferingDetails.selfDescription.verifiableCredential.credentialSubject['gax-trust-framework:termsAndConditions']) {
        if (tnc['gax-trust-framework:content']['@value'] === merlotTnC['gax-trust-framework:content']['@value'] 
              && tnc['gax-trust-framework:hash']['@value'] === merlotTnC['gax-trust-framework:hash']['@value']) {
          tnc["overrideName"] = "Merlot AGB";
          tnc['gax-trust-framework:content']['disabled'] = true;
          tnc['gax-trust-framework:hash']['disabled'] = true;
        }
        else if (tnc['gax-trust-framework:content']['@value'] === providerTnC['gax-trust-framework:content']['@value'] 
                && tnc['gax-trust-framework:hash']['@value'] === providerTnC['gax-trust-framework:hash']['@value']) {
          tnc["overrideName"] = "Anbieter AGB";
          tnc['gax-trust-framework:content']['disabled'] = true;
          tnc['gax-trust-framework:hash']['disabled'] = true;
        }
      }
      this.wizardExtensionService.prefillFields(this.wizard, this.selectedOfferingDetails.selfDescription.verifiableCredential.credentialSubject);
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
          // add a field containing the id to avoid creating a new offering
          this.filteredShapes[0].fields.push({
            id: 'user_prefix',
            value: this.selectedOfferingDetails.selfDescription.verifiableCredential.credentialSubject["@id"],
            key: '',
            name: '',
            datatype: {
              prefix: '',
              value: ''
            },
            required: false,
            minCount: 0,
            maxCount: 0,
            order: 0,
            group: '',
            controlTypes: [],
            in: [],
            or: [],
            validations: [],
            componentType: '',
            childrenFields: [],
            childrenSchema: '',
            prefix: '',
            values: [],
            description: '',
            selfLoop: false
          });
          //set description.input value depending on language
          this.updateSelectedShape();
        }
      }
    );
  }

  updateSelectedShape(): void {
    const shape = this.filteredShapes[0];
    if (shape !== undefined) {
      let tncField = shape?.fields.filter(f => f.key === "termsAndConditions")[0];
      tncField.minCount = 2;
      this.shaclFile.shapes.find(x => x.name === shape.name).selected = true;
    }
  }

  bookServiceOffering(offeringId: string): void {
    this.contractApiService.createNewContract(
      offeringId, 
      this.authService.getActiveOrgaId())
      .then(result => {
        console.log(result)
        this.contractTemplate = result;
      });
  }

  protected getLocalDate(utcDateTime: string) {
    let date = new Date(utcDateTime);
    return date.toLocaleString();
  }
}
