import { ChangeDetectorRef, Component, EventEmitter, ViewChild } from '@angular/core';
import { ShaclFile } from '@models/shacl-file';
import { Shape } from '@models/shape';
import { OrganizationsApiService } from '../services/organizations-api.service';
import { FormfieldControlService } from '@services/form-field.service';
import { DynamicFormComponent } from '../sdwizard/core/dynamic-form/dynamic-form.component';
import { ServiceofferingApiService } from '../services/serviceoffering-api.service';
import { ExpandedFieldsComponent } from '@components/expanded-fields/expanded-fields.component';
import { AbstractControl, FormControl } from '@angular/forms';
import { DynamicFormInputComponent } from '@components/dynamic-form-input/dynamic-form-input.component';
import { DynamicFormArrayComponent } from '@components/dynamic-form-array/dynamic-form-array.component';
import { BehaviorSubject, takeWhile } from 'rxjs';
import { ExportService } from '@services/export.service';
import { StatusMessageComponent } from '../views/common-views/status-message/status-message.component';
import { HttpErrorResponse } from '@angular/common/http';
import { ActiveOrganizationRoleService } from 'src/app/services/active-organization-role.service';
import { Mutex } from 'async-mutex';


@Component({
  selector: 'app-wizard-extension',
  templateUrl: './wizard-extension.component.html',
  styleUrls: ['./wizard-extension.component.scss']
})
export class WizardExtensionComponent {
  @ViewChild("wizard") protected wizard: DynamicFormComponent;
  @ViewChild("saveStatusMessage") private saveStatusMessage: StatusMessageComponent;
  protected shaclFile: ShaclFile;
  protected submitButtonsDisabled: boolean = false;
  protected filteredShapes: Shape[];
  protected orgaIdFields: AbstractControl[] = [];
  protected wizardVisible: boolean = false;
  submitCompleteEvent: EventEmitter<any> = new EventEmitter();

  private shapeInitialized: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private wizardMutex: Mutex = new Mutex();

  constructor(private formFieldService: FormfieldControlService,
    private organizationsApiService: OrganizationsApiService,
    private serviceofferingApiService: ServiceofferingApiService,
    private activeOrgRoleService: ActiveOrganizationRoleService,
    private exportService: ExportService,
    private changeDetectorRef: ChangeDetectorRef) {}

  private selectShape(shaclFile: ShaclFile, credentialSubjectId: string): void {
    this.shaclFile = shaclFile;
    this.filteredShapes = this.formFieldService.updateFilteredShapes(this.shaclFile);
    if (this.filteredShapes.length > 1) {
      console.log("too many shapes selected");
    }
    else {
      // add a field containing the id to avoid creating a new offering
      this.filteredShapes[0].fields.push({
        id: 'user_prefix',
        value: credentialSubjectId,
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
      console.table(this.shaclFile);
      this.updateSelectedShape();
    }
  }

  private updateSelectedShape(): void {
    const shape = this.filteredShapes[0];
    if (shape !== undefined) {
      this.shaclFile.shapes.find(x => x.name === shape.name).selected = true;
    }
  }

  private reinitWizard(): void{
    this.wizardVisible = false;
    this.changeDetectorRef.detectChanges();
    this.orgaIdFields = [];
    this.shaclFile = undefined;
    this.shapeInitialized.next(false);
    this.wizardVisible = true;
    this.changeDetectorRef.detectChanges();
}

  public async loadShape(shapeName: string, id: string): Promise<void> {
    await this.wizardMutex.runExclusive(async () => {
      this.reinitWizard();
      console.log("Loading shape", shapeName);
      let shapeResult: Promise<any>;
      if (shapeName === "MerlotOrganization") {
        shapeResult = this.organizationsApiService.getMerlotParticipantShape();
      } else {
        shapeResult = this.serviceofferingApiService.fetchShape(shapeName);
      }
      let shape = await shapeResult;
      this.selectShape(this.formFieldService.readShaclFile(shape), id);
      this.shapeInitialized.next(true);
    });
  }

  public isShapeLoaded(): boolean {
    return this.shapeInitialized.value;
  }

  private createDateTimer: NodeJS.Timer = undefined;

  private prefillWaitForWizard(selfDescriptionFields: any) {
    this.wizard.finishedLoading
      .pipe(takeWhile(finishedLoading => !finishedLoading, true)) // subscribe until finishedLoading is true for first time (inclusive), then unsubscribe
      .subscribe(finishedLoading => {
        if (!finishedLoading) {
          console.log("Wizard not yet ready, waiting for init.");
          return;
        } 

        console.log("Wizard initialized");
        console.log("start prefilling fields");
        
        this.wizardMutex.runExclusive(() => {
          for (let expandedField of this.wizard.expandedFieldsViewChildren) {
            this.processExpandedField(expandedField, selfDescriptionFields);
            }
          for (let formInput of this.wizard.formInputViewChildren) {
            this.processFormInput(formInput, selfDescriptionFields);
          }
          for (let formArray of this.wizard.formArrayViewChildren) {
            this.processFormArray(formArray, selfDescriptionFields);
          }
        });
      });
  }

  private prefillWaitForShape(selfDescriptionFields: any) {
    this.shapeInitialized
      .pipe(takeWhile(shapeInitialized => !shapeInitialized, true)) // subscribe until shapeInitialized is true for first time (inclusive), then unsubscribe
      .subscribe(shapeInitialized => {
        if (!shapeInitialized) {
          console.log("Shape not yet initialized, waiting for init.");
          return;
        }

        console.log("Shape initialized");
        this.prefillWaitForWizard(selfDescriptionFields);
      });
  }


  public prefillFields(selfDescriptionFields: any) {
    if (this.createDateTimer) {
      clearInterval(this.createDateTimer);
    }
    this.prefillWaitForShape(selfDescriptionFields);
  }

  private processFormArray(formArray: DynamicFormArrayComponent, prefillFields: any) {
    if (formArray === undefined || prefillFields === undefined) {
      return;
    }

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
      if (prefillFields[parentKey][i] instanceof Object && Object.keys(prefillFields[parentKey][i]).includes("disabled") && prefillFields[parentKey][i]["disabled"]) {
        control.disable();
      }
      i += 1;
    }
  }

  private updateDateField(formControl: FormControl) {
    formControl.patchValue(new Date().toLocaleString("de-DE", {timeZone: "Europe/Berlin", timeStyle: "short", dateStyle: "medium"}));
  }

  private processFormInput(formInput: DynamicFormInputComponent, prefillFields: any) {
    if (formInput === undefined || prefillFields === undefined) {
      return;
    }

    let fullKey = formInput.input.prefix + ":" + formInput.input.key;

    if (["gax-core:offeredBy", "gax-trust-framework:providedBy"].includes(fullKey)) {
      this.orgaIdFields.push(formInput.form.controls[formInput.input.id]); // save for later reference
    } 
    if (fullKey === "merlot:creationDate") {
      if (!Object.keys(prefillFields).includes(fullKey)) {
        this.updateDateField(formInput.form.controls[formInput.input.id] as FormControl); // initial update
        this.createDateTimer = setInterval(() => this.updateDateField(formInput.form.controls[formInput.input.id] as FormControl), 1000); // set timer to refresh date field
      }
      formInput.form.controls[formInput.input.id].disable();
    }

    if (!Object.keys(prefillFields).includes(fullKey)) {
      return;
    }

    formInput.form.controls[formInput.input.id].patchValue(this.unpackValueFromField(prefillFields[fullKey]));
    if (prefillFields[fullKey] instanceof Object && Object.keys(prefillFields[fullKey]).includes("disabled") && prefillFields[fullKey]["disabled"]) {
      formInput.form.controls[formInput.input.id].disable();
    }
  }

  private processExpandedField(expandedField: ExpandedFieldsComponent, prefillFields: any) {
    if (expandedField === undefined || prefillFields === undefined) {
      return;
    }

    let parentKey = expandedField.input.prefix + ":" + expandedField.input.key;
    if (!Object.keys(prefillFields).includes(parentKey)) {
      return;
    }
    // create more inputs for each prefill field after the first one
    let updatedInput = false;
    for (let i = expandedField.inputs.length; i < prefillFields[parentKey].length; i++) {
      expandedField.addInput();
      updatedInput = true;
    }
    for (let i = expandedField.inputs.length; i > prefillFields[parentKey].length; i--) {
      expandedField.deleteInput(-1);
      updatedInput = true;
    }

    // if we created new inputs, wait for changes
    if (updatedInput) {
      let formInputSub = expandedField.formInputViewChildren.changes.subscribe(_ => {
        this.processExpandedFieldChildrenFields(expandedField, prefillFields);
        formInputSub.unsubscribe();
      });
      let expandedFieldSub = expandedField.expandedFieldsViewChildren.changes.subscribe(_ => {
        this.processExpandedFieldChildrenFields(expandedField, prefillFields);
        expandedFieldSub.unsubscribe();
      });
      let formArraySub = expandedField.formArrayViewChildren.changes.subscribe(_ => {
        this.processExpandedFieldChildrenFields(expandedField, prefillFields);
        formArraySub.unsubscribe();
      });
    } else { //otherwise just start immediately
      this.processExpandedFieldChildrenFields(expandedField, prefillFields);
    }
  }

  private processExpandedFieldChildrenFields(expandedField: ExpandedFieldsComponent, prefillFields: any) {
    let parentKey = expandedField.input.prefix + ":" + expandedField.input.key;

    // since we are always working with a list of inputs, we need to adapt to that in the prefill as well (even if it is just one element)
    if (!(prefillFields[parentKey] instanceof Array)) {
      prefillFields[parentKey] = [prefillFields[parentKey]];
    }

    let i = 0;
    for (let input of expandedField.inputs) {
      if (prefillFields[parentKey][i] instanceof Object && Object.keys(prefillFields[parentKey][i]).includes("overrideName")) {
        input.name = prefillFields[parentKey][i]["overrideName"];
      }
      for (let cf of input.childrenFields) {
        this.processFormInput(expandedField.formInputViewChildren.find(f => f.input.id === cf.id), prefillFields[parentKey][i]);
        this.processExpandedField(expandedField.expandedFieldsViewChildren.find(f => f.input.id === cf.id), prefillFields[parentKey][i]);
        this.processFormArray(expandedField.formArrayViewChildren.find(f => f.input.id === cf.id), prefillFields[parentKey][i]);
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

  private async saveSelfDescription(jsonSd: any) {
    if (this.filteredShapes[0].name === "MerlotOrganization") {
      return await this.organizationsApiService.saveOrganization(JSON.stringify(jsonSd, null, 2), jsonSd["@id"]);
    } else {
      return await this.serviceofferingApiService.createServiceOffering(JSON.stringify(jsonSd, null, 2), jsonSd["@type"]);
    }
  }

  protected onSubmit(publishAfterSave: boolean): void {
    console.log("onSubmit");
    this.submitButtonsDisabled = true;
    this.saveStatusMessage.hideAllMessages();

    // for fields that contain the id of the creator organization, set them to the actual id
    for (let control of this.orgaIdFields) {
      control.patchValue(this.activeOrgRoleService.getActiveOrgaId());
    }
    this.wizard.shape.userPrefix = this.wizard.form.get('user_prefix').value;
    this.wizard.shape.downloadFormat = this.wizard.form.get('download_format').value;
    this.wizard.shape.fields = this.wizard.updateFormFieldsValues(this.wizard.formFields, this.wizard.form);
    this.wizard.shape.fields = this.wizard.emptyChildrenFields(this.wizard.shape.fields);
    let jsonSd = this.exportService.saveFile(this.wizard.file);

    // revert the actual id to the orga for user readibility
    for (let control of this.orgaIdFields) {
      control.patchValue(this.activeOrgRoleService.getActiveOrgaLegalName());
    }

    this.saveSelfDescription(jsonSd).then(result => {
      console.log(result);
      let didField = this.wizard.form.get("user_prefix");
      didField.patchValue(result["id"]);
      this.saveStatusMessage.showSuccessMessage("ID: " + result["id"]);

      if (publishAfterSave) {
        this.serviceofferingApiService.releaseServiceOffering(result["id"])
        .then(_ => {
          this.submitCompleteEvent.emit(null);
        })
        .catch((e: HttpErrorResponse) => {
          this.saveStatusMessage.showErrorMessage(e.error.message);
          this.submitButtonsDisabled = false;
        })
        .catch(_ => {
          this.saveStatusMessage.showErrorMessage("Unbekannter Fehler");
          this.submitButtonsDisabled = false;
        });
      } else {
        this.submitCompleteEvent.emit(null);
      }
    }).catch((e: HttpErrorResponse) => {
      this.saveStatusMessage.showErrorMessage(e.error.message);
      this.submitButtonsDisabled = false;
    })
    .catch(_ => {
      this.saveStatusMessage.showErrorMessage("Unbekannter Fehler");
      this.submitButtonsDisabled = false;
    }).finally(() => {
      if (!publishAfterSave) {
        this.submitButtonsDisabled = false;
      }
    });
  }

  public ngOnDestroy() {
    if (this.wizard) {
      this.wizard.ngOnDestroy();
    }
    this.saveStatusMessage.hideAllMessages();
    this.submitButtonsDisabled = false;
  }
}
