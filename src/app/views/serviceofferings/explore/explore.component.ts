import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {IBasicOffering, IOfferings, IPageBasicOfferings, IPageOfferings} from '../serviceofferings-data'
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
import { FormField } from '@models/form-field.model';
import { ExpandedFieldsComponent } from '@components/expanded-fields/expanded-fields.component';
import { FormControl, FormGroup } from '@angular/forms';
import { DynamicFormInputComponent } from '@components/dynamic-form-input/dynamic-form-input.component';
import { DynamicFormArrayComponent } from '@components/dynamic-form-array/dynamic-form-array.component';
import { throws } from 'assert';


@Component({
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss']
})
export class ExploreComponent implements OnInit, OnDestroy, AfterViewInit {
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

  private refreshOrgaOfferings(page: number, size: number, statusFilter: string = undefined) {
    if (this.authService.isLoggedIn) {
      this.serviceOfferingApiService.fetchOrganizationServiceOfferings(page, size, statusFilter).then(result => {
      this.activeOrgaOfferingPage.next(result);
      this.initialLoading = false;
    });
    }
  }

  protected filterByStatus(applyFilter: boolean, status: string) {
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
    });
    
  }

  ngAfterViewInit(): void {
    this.wizard.expandedFieldsViewChildren.changes.subscribe(_ => {
      for (let expandedField of this.wizard.expandedFieldsViewChildren) {
        this.processExpandedField(expandedField, this.selectedOfferingDetails.selfDescription.verifiableCredential.credentialSubject);
        console.log("update");
      }
    });

    this.wizard.formInputViewChildren.changes.subscribe(_ => {
      for (let formInput of this.wizard.formInputViewChildren) {
        this.processFormInput(formInput, this.selectedOfferingDetails.selfDescription.verifiableCredential.credentialSubject);
        console.log("update");
      }
    });

    this.wizard.formArrayViewChildren.changes.subscribe(_ => {
      for (let formArray of this.wizard.formArrayViewChildren) {
        this.processFormArray(formArray, this.selectedOfferingDetails.selfDescription.verifiableCredential.credentialSubject);
        console.log("update");
      }
    });
  }

  processFormArray(formArray: DynamicFormArrayComponent, prefillFields: any) {
    let parentKey = formArray.input.prefix + ":" + formArray.input.key;
    if (!Object.keys(prefillFields).includes(parentKey)) {
      return;
    }
    // create more inputs for each prefill field after the first one
    for (let i = formArray.input.minCount; i < prefillFields[parentKey].length; i++) {
      formArray.addInput();
    }

    let i = 0;
    for (let control of formArray.inputs.controls) {
      control.patchValue(this.unpackValueFromField(prefillFields[parentKey][i]));
      i += 1;
    }
  }

  processFormInput(formInput: DynamicFormInputComponent, prefillFields: any) {
    let fullKey = formInput.input.prefix + ":" + formInput.input.key;
    if (!Object.keys(prefillFields).includes(fullKey)) {
      return;
    }

    formInput.form.controls[formInput.input.id].patchValue(this.unpackValueFromField(prefillFields[fullKey]))
  }

  processExpandedField(expandedField: ExpandedFieldsComponent, prefillFields: any) {
    let parentKey = expandedField.input.prefix + ":" + expandedField.input.key;
    if (!Object.keys(prefillFields).includes(parentKey)) {
      return;
    }
    // create more inputs for each prefill field after the first one
    for (let i = expandedField.input.minCount; i < prefillFields[parentKey].length; i++) {
      expandedField.addInput();
    }

    // if we created new inputs, wait for changes
    if (prefillFields[parentKey].length > expandedField.input.minCount) {
      let formInputSub = expandedField.formInputViewChildren.changes.subscribe(_ => {
        this.processExpandedFieldChildrenFields(expandedField, prefillFields);
        console.log("update");
        formInputSub.unsubscribe();
      });
      let expandedFieldSub = expandedField.formArrayViewChildren.changes.subscribe(_ => {
        this.processExpandedFieldChildrenFields(expandedField, prefillFields);
        console.log("update");
        expandedFieldSub.unsubscribe();
      });
      let formArraySub = expandedField.formArrayViewChildren.changes.subscribe(_ => {
        this.processExpandedFieldChildrenFields(expandedField, prefillFields);
        console.log("update");
        formArraySub.unsubscribe();
      });
    } else { //otherwise just start immediately
      this.processExpandedFieldChildrenFields(expandedField, prefillFields);
    }
  }

  processExpandedFieldChildrenFields(expandedField: ExpandedFieldsComponent, prefillFields: any) {
    let parentKey = expandedField.input.prefix + ":" + expandedField.input.key;
    let i = 0;
    for (let input of expandedField.inputs) {
      
      for (let cf of input.childrenFields) {
        console.log("looking for", cf.id);
        let cfFormInput = expandedField.formInputViewChildren.find(f => f.input.id === cf.id);
        if (cfFormInput !== undefined) {
          console.log("found", cfFormInput.input.id);
          this.processFormInput(cfFormInput, prefillFields[parentKey][i]);
          continue;
        }
        let cfExpandedField = expandedField.expandedFieldsViewChildren.find(f => f.input.id === cf.id);
        if (cfExpandedField !== undefined) {
          this.processExpandedField(cfExpandedField, prefillFields[parentKey][i]);
          continue;
        }

        let cfFormArray = expandedField.formArrayViewChildren.find(f => f.input.id === cf.id);
        if (cfExpandedField !== undefined) {
          this.processFormArray(cfFormArray, prefillFields[parentKey][i]);
          continue;
        }
      }
      i += 1;
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
      this.authService.getActiveOrgaId())
      .then(result => {
        console.log(result)
        this.contractTemplate = result;
      });
  }
}
