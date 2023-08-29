import {Component, OnInit, Input, OnDestroy, HostListener} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {FormField} from '@models/form-field.model';
import {FormfieldControlService} from '@services/form-field.service';
import {Router} from '@angular/router';
import {Shape} from '@models/shape';
import {Utils} from '@shared/utils';
import {ExportService} from '@services/export.service';
import {ShaclFile} from '@models/shacl-file';
import {DateHelper} from '@shared/date-helper';
import {FilesProvider} from '@shared/files-provider';
import {DownloadFormat} from '@shared/download-format.enum';
import { Subscription, throwError } from 'rxjs';

import { IconSetService } from '@coreui/icons-angular';
import { brandSet, flagSet, freeSet } from '@coreui/icons';
import { off } from 'process';
import { AuthService } from 'src/app/services/auth.service';
import { OrganizationsApiService } from 'src/app/services/organizations-api.service';
import {timer} from 'rxjs';
import { ServiceofferingApiService } from 'src/app/services/serviceoffering-api.service';
import { IOfferings } from 'src/app/views/serviceofferings/serviceofferings-data';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss']
})
export class DynamicFormComponent implements OnInit, OnDestroy {

  formFields: FormField[] = [];
  @Input() file: ShaclFile = new ShaclFile();
  shape: Shape;
  form: FormGroup = new FormGroup({});
  routeState: any;
  requestSuccess = false;
  multipleShapes = false;
  hasStaticFiles = false;
  groupedFormFields: FormField[][];
  groupsNumber = 1;
  DownloadFormat = DownloadFormat;
  downloadFormatKeys = Object.keys(DownloadFormat).filter(e => typeof (e) === 'string');

  showSuccessMessage: boolean = false;
  showErrorMessage: boolean = false;
  errorDetails: string = "";
  createdServiceOfferingId: string = "";

  createDateTimer: NodeJS.Timer = undefined;
  orgaSubscriptions: Subscription[] = [];
  submitButtonsDisabled = false;

  protected hiddenFormFields = [];

  protected hiddenFormFieldsOffering = ["policy", "dataAccountExport", "aggregationOf", "dependsOn", "dataProtectionRegime", "keyword", "provisionType", "endpoint", "ServiceOfferingLocations"];
  protected hiddenFormFieldsOrganization = ["description", "legalForm", "leiCode", "parentOrganization", "subOrganization", "headquarterAddress"];

  constructor(
    private formfieldService: FormfieldControlService,
    private router: Router,
    private exportService: ExportService,
    private filesProvider: FilesProvider, 
    private iconSetService: IconSetService,
    private authService: AuthService,
    private organizationsApiService: OrganizationsApiService,
    private serviceofferingApiService: ServiceofferingApiService
  ) {
    this.readObjectDataFromRoute();
    if (this.requestSuccess) {
      this.getFormFields();
    }
    this.hasStaticFiles = filesProvider.gethasStaticFiles();
    // iconSet singleton
    iconSetService.icons = { ...freeSet, ...flagSet, ...brandSet };
  }

  ngOnChanges() {
    if (this.requestSuccess) {
      this.getFormFields();
    }
    this.hasStaticFiles = this.filesProvider.gethasStaticFiles();
  } 

  ngOnInit(): void {
  }

  getFormFields(): void {
    this.shape = this.file?.shapes.find(shape => shape.selected);
    if (this.shape?.name === "MerlotOrganization") {
      this.hiddenFormFields = this.hiddenFormFieldsOrganization;
    } else {
      this.hiddenFormFields = this.hiddenFormFieldsOffering;
    }
    this.reorderShapeFields();
    this.formFields = this.shape?.fields;
    this.form = this.formfieldService.toFormGroup(this.formFields);
    this.form.addControl('user_prefix', new FormControl());
    this.form.addControl('download_format', new FormControl(DownloadFormat.jsonld));

    this.groupFormFields();
  }

  reorderShapeFields(): void {
    // TODO set order in SHACL instead
    if (this.shape?.fields === undefined) {
      return;
    }
    console.log("shape fields", this.shape?.fields);
    let beforeFieldsNames = [];
    let afterFieldsNames = [];
    if (this.shape?.name === "MerlotOrganization") {
      beforeFieldsNames = ["merlotId", "orgaName", "legalName", "mailAddress", "addressCode"];
      afterFieldsNames = [];
    } else {
      beforeFieldsNames = ["name", "offeredBy", "providedBy", "creationDate"];
      afterFieldsNames = ["merlotTermsAndConditionsAccepted"];
    }
    
    let shapeFieldCopy = this.shape?.fields;
    shapeFieldCopy.sort((a, b) => (a.key < b.key ? -1 : 1));

    let beforeFields = [];
    let afterFields = [];

    for (let i = 0; i < shapeFieldCopy.length;) {
      let f = shapeFieldCopy[i];
      if (beforeFieldsNames.includes(f.key)) {
        beforeFields.splice(beforeFields.indexOf(f.key), 0, f);
        shapeFieldCopy.splice(i, 1);
      } else if (afterFieldsNames.includes(f.key)) {
        afterFields.splice(afterFields.indexOf(f.key), 0, f);
        shapeFieldCopy.splice(i, 1);
      } else {
        i++;
      }
    }

    this.shape.fields = beforeFields.concat(shapeFieldCopy.concat(afterFields));
  }

  groupFormFields(): void {
    this.groupedFormFields = Utils.groupBy(this.formFields, (formField) => formField.group);
    if (this.shape?.name === "MerlotOrganization") {
      this.patchRequiredFieldsOrganization(this.groupedFormFields);
    } else {
      this.patchRequiredFieldsOffering(this.groupedFormFields);
    }
    this.groupsNumber = this.groupedFormFields.length;
  }

  private updateDateField(formInput: FormControl) {
    formInput.patchValue(new Date().toLocaleString("de-DE", {timeZone: "Europe/Berlin", timeStyle: "short", dateStyle: "medium"}));
  }

  private patchRequiredFieldsOrganization(groupedFormFields: FormField[][]) {
    let deactivatedFields = ["legalName", "orgaName", "merlotId", "registrationNumber"];
    for (let group of groupedFormFields) {
      for (let field of group) {
        if (deactivatedFields.includes(field.key)) {
          let formField = this.form.get(field.id);
          formField.disable();
        }
      }
    }
  }

  private patchRequiredFieldsOffering(groupedFormFields: FormField[][]) {
    // Automatically fill fields depending on selected Organization and time, also set required fields of gax-trust-framework that are hidden
    for (let group of groupedFormFields) {
      for (let field of group) {
        if ((field.key === "offeredBy" || field.key === "providedBy")) {
          let formField = this.form.get(field.id);
          this.orgaSubscriptions.push(this.authService.activeOrganizationRole.subscribe((value) => {
            formField.patchValue(value.orgaData.selfDescription.verifiableCredential.credentialSubject['gax-trust-framework:legalName']['@value']);
          }));
          formField.disable();
        } else if (field.key === "creationDate") {
          let formField = this.form.get(field.id);
          if (formField.value === undefined || formField.value === null) {
            if (this.createDateTimer !== undefined) {
              clearInterval(this.createDateTimer);
            }
            this.updateDateField(formField as FormControl); // initial update
            this.createDateTimer = setInterval(() => this.updateDateField(formField as FormControl), 1000); // set timer to refresh date field
          }

          formField.disable();
        }
        else if (field.key === "policy") {
          let formField = this.form.get(field.id);
          formField.patchValue(["dummyPolicy"]);
          formField.disable();
        }
        else if (field.key === "dataAccountExport") {
          let formField = this.form.get(field.id) as FormGroup;
          for (let childKey in formField.controls) {
            let child = formField.controls[childKey];
            child.patchValue("dummyValue");
            child.disable();
          }
        }
      }
    }
    
    // set did to a dummy value that gets replaced by the orchestrator
    let didField = this.form.get("user_prefix");

    if (didField.value === undefined || didField.value === null) {
      didField.patchValue("ServiceOffering:TBR");
    }
    
    didField.disable();
  }

  private patchFieldsForSubmit(groupedFormFields: FormField[][]) {
    // replace the fields containing the Organization name with their id
    for (let group of groupedFormFields) {
      for (let field of group) {
        if (field.key === "offeredBy" || field.key === "providedBy" ) {
          let formField = this.form.get(field.id);
          formField.patchValue(this.authService.activeOrganizationRole.value.orgaData.selfDescription.verifiableCredential.credentialSubject['@id']);
        }
      }
    }
  }

  readObjectDataFromRoute(): void {
    if (this.router.getCurrentNavigation().extras.state) {
      this.routeState = this.router.getCurrentNavigation().extras.state;
      if (this.routeState) {
        this.requestSuccess = true;
        this.file = this.routeState.file;
      }
    } else {
      this.file = undefined;
    }
    this.multipleShapes = this.formfieldService.updateFilteredShapes(this.file)?.length > 1;
  }

  goToShapes(): void {
    this.file.shapes.forEach(shape => shape.selected = false); // set selected to false
  }

  goToFiles(): void {
  }

  makeId(length: number):string {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
      charactersLength));
   }
   return result;
}
  onSubmit(publishAfterSave: boolean): void {
    this.submitButtonsDisabled = true;
    this.showSuccessMessage = false;
    this.showErrorMessage = false;
    this.createdServiceOfferingId = "";
    this.errorDetails = "";

    this.shape.userPrefix = this.form.get('user_prefix').value;

    this.patchFieldsForSubmit(this.groupedFormFields);

    this.shape.downloadFormat = this.form.get('download_format').value;
    console.log("shape fields pre update/empty", this.shape.fields);  
    this.shape.fields = this.updateFormFieldsValues(this.formFields, this.form);
    this.shape.fields = this.emptyChildrenFields(this.shape.fields);
    console.log("shape fields pre save", this.shape.fields);
    this.exportService.saveFile(this.file)
      .then(result => {
        console.log(result);
        this.showSuccessMessage = true;
        this.createdServiceOfferingId = result["id"];
        let didField = this.form.get("user_prefix");
        didField.patchValue(result["id"]);

        if (publishAfterSave) {
          this.serviceofferingApiService.releaseServiceOffering(result["id"])
          .catch((e: HttpErrorResponse) => {
            this.showErrorMessage = true;
            this.errorDetails = e.error.message;
            this.submitButtonsDisabled = false;
          })
          .catch(e => {
            this.showErrorMessage = true;
            this.errorDetails = "Unbekannter Fehler.";
            this.submitButtonsDisabled = false;
          });
        }
      })
      .catch((e: HttpErrorResponse) => {
        this.showErrorMessage = true;
        this.errorDetails = e.error.message;
        this.submitButtonsDisabled = false;
      })
      .catch(e => {
        this.showErrorMessage = true;
        this.errorDetails = "Unbekannter Fehler.";
        this.submitButtonsDisabled = false;
      }).finally(() => {
        if (!publishAfterSave) {
          this.submitButtonsDisabled = false;
        }
      });
    if (this.shape?.name !== "MerlotOrganization") {
      this.patchRequiredFieldsOffering(this.groupedFormFields); // re-patch the fields so the user sees the resolved names instead of ids
    }
  }

  ngOnDestroy() {
    console.log("Destroying dynamic form component"); 
    if (this.createDateTimer)
      clearInterval(this.createDateTimer);
    
    for (let orgaSub of this.orgaSubscriptions) {
      orgaSub.unsubscribe();
    }
    this.orgaSubscriptions = [];

    this.showSuccessMessage = false;
    this.showErrorMessage = false;
    this.submitButtonsDisabled = false;
  }


  emptyFormFieldValues(formFields: FormField[]): void {
    formFields.forEach(formField => {
      formField.values = [];
      if (formField.childrenFields.length > 0 && !formField.selfLoop) {
        this.emptyFormFieldValues(formField.childrenFields);
      }
    });
  }

  updateFormFieldsValues(formFields: FormField[], formGroup: FormGroup): FormField[] {
    formFields.forEach(field => {
      if (formGroup) {
        if (field.childrenSchema === '') {
          const value = formGroup.get(field.id)?.value;
          field = this.getFieldValue(field, value);
        } else {
          const nestedformGroup = formGroup.get(field.id) as FormGroup;
          this.updateFormFieldsValues(field.childrenFields, nestedformGroup);
        }
      }

    });
    return formFields;
  }

  getFieldValue(field: FormField, value: any): FormField {
    field.values = [];
    const dateConvertedValues = [];
    if (Array.isArray(value)) {
      let filtered = value.filter(el => el != null); // remove null elements from array
      if (field.datatype !== undefined && field.datatype?.value?.includes('date')) {
        filtered.forEach(v => {
          dateConvertedValues.push(DateHelper.transformDate(field, v));
        });
        filtered = dateConvertedValues;
      }
      field.values.push(...filtered);
    } else {
      if (field.datatype !== undefined && field.datatype?.value?.includes('date')) {
        value = DateHelper.transformDate(field, value);
      }
      field.values.push(value);
    }

    return field;
  }

  emptyChildrenFields(formFields: FormField[]): any {
    const ids: string[] = [];
    formFields.forEach(formField => {
      if (formField.childrenSchema !== '') {
        const values = this.emptyChildrenField(formField);
        const empty = values.length === 0;
        if (empty) {
          ids.push(formField.id);
        }
      }
    });
    const toDelete = new Set(ids);
    Utils.filterInPlace(formFields, obj => !toDelete.has(obj.id));
    return formFields;
  }

  emptyChildrenField(field: FormField, values: string[] = []): string[] {
    if (field.childrenSchema === '') {
      values.push(...field.values);
    } else {
      field.childrenFields.forEach(child => {
        this.emptyChildrenField(child, values);
      });
    }
    return values;
  }
  reportError(msg:string){
    throw Error(msg);
  }
}
