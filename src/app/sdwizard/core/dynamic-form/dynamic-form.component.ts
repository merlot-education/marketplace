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
import { IOfferingsDetailed } from 'src/app/views/serviceofferings/serviceofferings-data';

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

  @Input() prefillData: IOfferingsDetailed = undefined;

  showSuccessMessage: boolean = false;
  showErrorMessage: boolean = false;
  createdServiceOfferingId: string = "";

  createDateTimer: NodeJS.Timer = undefined;
  orgaSubscriptions: Subscription[] = [];
  submitButtonsDisabled = false;


  protected hiddenFormFields = ["policy", "dataAccountExport", "aggregationOf", "dependsOn", "dataProtectionRegime", "keyword", "provisionType", "endpoint", "ServiceOfferingLocations"];

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
    let prefilledFields = this.prefillShapeFields(this.shape?.fields, this.prefillData);
    if (this.shape !== undefined && prefilledFields !== undefined && prefilledFields.length > 0) {
      this.shape.fields = prefilledFields;
    }
    this.reorderShapeFields();
    this.formFields = this.shape?.fields;
    this.form = this.formfieldService.toFormGroup(this.formFields);
    this.form.addControl('user_prefix', new FormControl());
    this.form.addControl('download_format', new FormControl(DownloadFormat.jsonld));

    this.groupFormFields();
  }

  reorderShapeFields(): void {
    if (this.shape?.fields === undefined) {
      return;
    }
    console.log("shape fields", this.shape?.fields);

    let beforeFieldsNames = ["name", "offeredBy", "providedBy", "creationDate"];
    let afterFieldsNames = ["merlotTermsAndConditionsAccepted"];

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

  prefillShapeFields(shapeFields: FormField[], prefillData: IOfferingsDetailed): FormField[] {
    if (shapeFields === undefined || prefillData === undefined) {
      return;
    }

    if ("offeredBy" in prefillData)
      prefillData["providedBy"] = prefillData["offeredBy"];  // since we store the same in both fields, only one is returned by the backend

    let additionalFields = [];


    for (let field of shapeFields) {
      if (field.key in prefillData) {
        if (prefillData[field.key] instanceof Array) {
          if (field.componentType === "dynamicFormArray") {  // array of primitives
            field.values = prefillData[field.key];
          } else {
            for (let i = 0; i < prefillData[field.key].length; i++) {
              if (i === 0) {
                field.id = field.id + "_" + i.toString();
                field.childrenFields = this.prefillShapeFields(field.childrenFields, prefillData[field.key][i])
              } else {
                let fieldcopy = structuredClone(field);
                fieldcopy.id = fieldcopy.id + "_" + i.toString();
                fieldcopy.childrenFields = this.prefillShapeFields(fieldcopy.childrenFields, prefillData[field.key][i])
                additionalFields.push(fieldcopy);
              }
            }
          }
          
        } else if (prefillData[field.key] instanceof Object) {
          field.childrenFields = this.prefillShapeFields(field.childrenFields, prefillData[field.key])
        } else {
          field.value = prefillData[field.key];
        }
      } else {
      }
      /*if (field.key === "userCountOption") {
        for (let j = 0; j < 3; j++) {
          let fieldcopy = structuredClone(field);
          fieldcopy.id = fieldcopy.id + "_" + j.toString();
          shapeFieldCopy.push(fieldcopy);
        }
      }*/
    }

    shapeFields = shapeFields.concat(additionalFields);
    return shapeFields;
  }

  groupFormFields(): void {
    this.groupedFormFields = Utils.groupBy(this.formFields, (formField) => formField.group);
    this.patchRequiredFields(this.groupedFormFields);
    this.groupsNumber = this.groupedFormFields.length;
  }

  private updateDateField(formInput: FormControl) {
    formInput.patchValue(new Date().toLocaleString("de-DE", {timeZone: "Europe/Berlin", timeStyle: "short", dateStyle: "medium"}));
  }

  private patchRequiredFields(groupedFormFields: FormField[][]) {
    // Automatically fill fields depending on selected Organization and time, also set required fields of gax-trust-framework that are hidden
    for (let group of groupedFormFields) {
      for (let field of group) {
        if ((field.key === "offeredBy" || field.key === "providedBy")) {
          let formField = this.form.get(field.id);
          // TODO create subscription for each of the two fields
          if (this.prefillData === undefined) {
            this.orgaSubscriptions.push(this.authService.activeOrganizationRole.subscribe((value) => {
              formField.patchValue(this.organizationsApiService.getOrgaById(value.orgaId).organizationLegalName);
            }));
          } else {
            let orgaId = this.prefillData.offeredBy.split(":").slice(1).join();
            if (orgaId !== "")
              formField.patchValue(this.organizationsApiService.getOrgaById(orgaId).organizationLegalName);
          }
            
          formField.disable();
        } else if (field.key === "creationDate") {
          let formField = this.form.get(field.id);
          if (this.prefillData === undefined) {
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
    if (this.prefillData === undefined) {
      didField.patchValue("ServiceOffering:TBR");
    } else {
      didField.patchValue(this.prefillData.id);
    }
    
    didField.disable();
  }

  private patchFieldsForSubmit(groupedFormFields: FormField[][]) {
    // replace the fields containing the Organization name with their id
    for (let group of groupedFormFields) {
      for (let field of group) {
        if (field.key === "offeredBy" || field.key === "providedBy" ) {
          let formField = this.form.get(field.id);
          if (this.prefillData === undefined)
            formField.patchValue("Participant:" + this.authService.activeOrganizationRole.value.orgaId);
          else
            formField.patchValue(this.prefillData.offeredBy);
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
        this.multipleShapes = this.formfieldService.updateFilteredShapes(this.file)?.length > 1;
      }
    }
  }

  goToShapes(): void {
    this.file.shapes.forEach(shape => shape.selected = false); // set selected to false
    this.router.navigate(['/select-shape'], {state: {file: this.file}});
  }

  goToFiles(): void {
    this.router.navigate(['/select-file']);
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

    this.shape.userPrefix = this.form.get('user_prefix').value;

    this.patchFieldsForSubmit(this.groupedFormFields);

    this.shape.downloadFormat = this.form.get('download_format').value;
    console.log("shape fields pre update/empty", this.shape.fields);  
    this.shape.fields = this.updateFormFieldsValues(this.formFields, this.form);
    this.shape.fields = this.emptyChildrenFields(this.shape.fields);
    console.log("shape fields pre save", this.shape.fields);
    this.exportService.saveFile(this.file).then(result => {
      console.log(result);
      if (result === undefined) {
        this.showErrorMessage = true;
        this.submitButtonsDisabled = false;
      } else {
        this.showSuccessMessage = true;
        this.createdServiceOfferingId = result["id"];
        let didField = this.form.get("user_prefix");
        didField.patchValue(result["id"]);

        // TODO reenable one or both buttons if successfull to allow further edits

        if (publishAfterSave) {
          this.serviceofferingApiService.releaseServiceOffering(result["id"]);
        }
        //this.navigateToOverview();
        /*timer(1500)
        .subscribe(i => { 
          this.router.navigate(['/service-offerings/explore']); 
        })*/
      }
    });
    this.patchRequiredFields(this.groupedFormFields); // re-patch the fields so the user sees the resolved names instead of ids
  }

  navigateToOverview() {
    this.router.navigate(['service-offerings/explore']); 
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
