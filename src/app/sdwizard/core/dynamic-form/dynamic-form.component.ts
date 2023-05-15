import {Component, OnInit, Input} from '@angular/core';
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
import { throwError } from 'rxjs';

import { IconSetService } from '@coreui/icons-angular';
import { brandSet, flagSet, freeSet } from '@coreui/icons';
import { off } from 'process';
import { AuthService } from 'src/app/services/auth.service';
import { OrganizationsApiService } from 'src/app/services/organizations-api.service';

@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss']
})
export class DynamicFormComponent implements OnInit {

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

  protected hiddenFormFields = ["policy", "dataAccountExport", "aggregationOf", "dependsOn", "dataProtectionRegime", "keyword", "provisionType", "endpoint", "ServiceOfferingLocations"];

  constructor(
    private formfieldService: FormfieldControlService,
    private router: Router,
    private exportService: ExportService,
    private filesProvider: FilesProvider, 
    private iconSetService: IconSetService,
    private authService: AuthService,
    private organizationsApiService: OrganizationsApiService
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
    this.formFields = this.shape?.fields;
    this.form = this.formfieldService.toFormGroup(this.formFields);
    this.form.addControl('user_prefix', new FormControl());
    this.form.addControl('download_format', new FormControl(DownloadFormat.jsonld));

    this.groupFormFields();
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
        if (field.key === "offeredBy" || field.key === "providedBy" ) {
          let formField = this.form.get(field.id);
          this.authService.activeOrganizationRole.subscribe((value) => {
            formField.patchValue(this.organizationsApiService.getOrgaById(value.orgaId).organizationLegalName);
          });
          formField.disable();
        } else if (field.key === "creationDate") {
          let formField = this.form.get(field.id);
          this.updateDateField(formField as FormControl); // initial update
          setInterval(() => this.updateDateField(formField as FormControl), 1000); // set timer to refresh date field
          formField.disable();
        }
        else if (field.key === "policy") {
          let formField = this.form.get(field.id);
          formField.patchValue(["dummyPolicy"]);
          formField.disable();
        }
        else if (field.key === "dataAccountExport") {
          let formField = this.form.get(field.id) as FormGroup;
          console.log(formField);
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
    didField.patchValue("ServiceOffering:TBR");
    didField.disable();
  }

  private patchFieldsForSubmit(groupedFormFields: FormField[][]) {
    // replace the fields containing the Organization name with their id
    for (let group of groupedFormFields) {
      for (let field of group) {
        if (field.key === "offeredBy" || field.key === "providedBy" ) {
          let formField = this.form.get(field.id);
          formField.patchValue("Participant:" + this.authService.activeOrganizationRole.value.orgaId);
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
  onSubmit(): void {
    this.patchFieldsForSubmit(this.groupedFormFields);
    console.log("its here"+this.form.get('user_prefix').value)
    if(typeof (this.form.get('user_prefix').value) == undefined || this.form.get('user_prefix').value == null || this.form.get('user_prefix').value == ""){
      this.shape.userPrefix ="did:web:registry.gaia-x.eu:"+this.shape.name+":"+this.makeId(36);
    }else{
      this.shape.userPrefix = this.form.get('user_prefix').value;
    }
    this.shape.downloadFormat = this.form.get('download_format').value;
    this.shape.fields = this.updateFormFieldsValues(this.formFields, this.form);
    this.shape.fields = this.emptyChildrenFields(this.shape.fields);
    this.exportService.saveFile(this.file);
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