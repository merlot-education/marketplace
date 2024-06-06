import {Component, OnInit, Input, OnDestroy, ViewChildren, QueryList, AfterViewChecked } from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {FormField} from '@models/form-field.model';
import {FormfieldControlService} from '@services/form-field.service';
import {Router} from '@angular/router';
import {Shape} from '@models/shape';
import {Utils} from '@shared/utils';
import {ShaclFile} from '@models/shacl-file';
import {DateHelper} from '@shared/date-helper';
import {FilesProvider} from '@shared/files-provider';
import {DownloadFormat} from '@shared/download-format.enum';
import { DynamicFormInputComponent } from '@components/dynamic-form-input/dynamic-form-input.component';
import { DynamicFormArrayComponent } from '@components/dynamic-form-array/dynamic-form-array.component';
import { DynamicFormOrComponent } from '@components/dynamic-form-or/dynamic-form-or.component';
import { DynamicFormOrArrayComponent } from '@components/dynamic-form-or-array/dynamic-form-or-array.component';
import { ExpandedFieldsComponent } from '@components/expanded-fields/expanded-fields.component';
import { DynamicSelfLoopsComponent } from '@components/dynamic-self-loops/dynamic-self-loops.component';
import { BehaviorSubject } from 'rxjs';
import { IconSetService } from '@coreui/icons-angular';
import { brandSet, flagSet, freeSet } from '@coreui/icons';

@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss']
})
export class DynamicFormComponent implements OnInit, OnDestroy, AfterViewChecked {

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

  submitButtonsDisabled = false;

  @ViewChildren('formInput') formInputViewChildren: QueryList<DynamicFormInputComponent>; 
  @ViewChildren('formArray') formArrayViewChildren: QueryList<DynamicFormArrayComponent>; 
  @ViewChildren('formOr') formOrViewChildren: QueryList<DynamicFormOrComponent>; 
  @ViewChildren('formOrArray') formOrArrayViewChildren: QueryList<DynamicFormOrArrayComponent>; 
  @ViewChildren('expandedFields') expandedFieldsViewChildren: QueryList<ExpandedFieldsComponent>; 
  @ViewChildren('selfLoops') selfLoopsViewChildren: QueryList<DynamicSelfLoopsComponent>; 
  finishedLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    private formfieldService: FormfieldControlService,
    private router: Router,
    private filesProvider: FilesProvider, 
    private iconSetService: IconSetService
  ) {
    this.readObjectDataFromRoute();
    if (this.requestSuccess) {
      this.getFormFields();
    }
    this.hasStaticFiles = filesProvider.gethasStaticFiles();
    iconSetService.icons = { ...freeSet, ...flagSet, ...brandSet };
  }
  ngAfterViewChecked(): void {
    if (this.groupsNumber) {
      this.finishedLoading.next(true);
      this.finishedLoading.next(false); // immediately reset
    } else {
      this.finishedLoading.next(false);
    }
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
    if (this.form.contains('user_prefix')) {
      this.form.controls['user_prefix'].disable()
    } else {
      this.form.addControl('user_prefix', new FormControl({value: '', disabled: true}));
    }
    this.form.addControl('download_format', new FormControl(DownloadFormat.jsonld));

    this.groupFormFields();
  }

  groupFormFields(): void {
    this.groupedFormFields = Utils.groupBy(this.formFields, (formField) => formField.group);
    this.groupsNumber = this.groupedFormFields.length;
  }

  readObjectDataFromRoute(): void {
    this.requestSuccess = true;
    this.file = undefined;
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

  ngOnDestroy() {
    console.log("Destroying dynamic form component"); 
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
