import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {IBasicOffering, IOfferings, IPageBasicOfferings, IPageOfferings} from '../serviceofferings-data'
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
import { IContract } from '../../contracts/contracts-data';
import { ConnectorData } from '../../organization/organization-data';
import { FormField } from '@models/form-field.model';


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
      this.requestDetails(this.selectedOfferingDetails.selfDescription.verifiableCredential.credentialSubject['@id']);
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
          })
          this.prefillFields(this.filteredShapes[0].fields, this.selectedOfferingDetails.selfDescription.verifiableCredential.credentialSubject);
          console.log("this here"+this.shaclFile);
          console.table(this.shaclFile);
          //set description.input value depending on language
          this.updateSelectedShape();
          //this.router.navigate(['/service-offerings/edit/form'], { state: { file: this.shaclFile } });
        }
      }
    );
  }

  private prefillFields(formFields: FormField[], selfDescriptionFields: any) {
    // create map from field names to field in prefillData
    let prefillFieldDict: {[fieldKey: string] : any} = {};
    for (let f_key in selfDescriptionFields) {
      prefillFieldDict[f_key.split(":")[1]] = selfDescriptionFields[f_key];
    }

    let additionalFields = [];

    // check fields in shape and fill them if possible
    for (let f of formFields) {
      if (f.key in prefillFieldDict) { // check if we have the field in our prefill data
        if (f.componentType === "dynamicFormInput") { // any basic data type
          f.value = this.unpackValueFromField(prefillFieldDict[f.key]);
        } else if (f.componentType === "dynamicFormArray") {  // array of primitives
          f.values = this.unpackValueFromField(prefillFieldDict[f.key]);
        } else if (f.componentType === "dynamicExpanded") { // complex field
          if (prefillFieldDict[f.key] instanceof Array) { // if it is an array, loop over all instances and copy original form field if needed
            for (let i = 0; i < prefillFieldDict[f.key].length; i++) {
              if (i === 0) {
                this.prefillFields(f.childrenFields, prefillFieldDict[f.key][i]); // first entry can stay as is
              } else {
                let fieldcopy = structuredClone(f); // further entries need to be copied from the original form field
                fieldcopy.id = fieldcopy.id + "_" + i.toString();
                this.prefillFields(fieldcopy.childrenFields, prefillFieldDict[fieldcopy.key][i]);
                additionalFields.push(fieldcopy);
              }
            }
          } else { // complex field but no array, simply call this recursively
            this.prefillFields(f.childrenFields, prefillFieldDict[f.key]);
          }
        }
      }
    }

    for (let a of additionalFields) { // if we collected new fields (from copying original fields), add them to the form
      formFields.push(a);
    }
  }

  private unpackValueFromField(field) {
    if (field instanceof Array) {
      let unpackedArray = []
      for (let f of field) {
        unpackedArray.push(this.unpackValueFromField(f));
      }
      return unpackedArray;
    } else if (!(field instanceof Object)) {
      return field;
    } else if ("@value" in field) {
      // patch 0 fields to be actually filled since they are regarded as null...
      if (field["@value"] === 0) {
        return "0";
      }
      return field["@value"]
    } else if ("@id" in field) {
      return field["@id"]
    }
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
