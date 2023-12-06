import { Component, ViewChild } from '@angular/core';
import { ShaclFile } from '@models/shacl-file';
import { Shape } from '@models/shape';
import { OrganizationsApiService } from '../services/organizations-api.service';
import { FormfieldControlService } from '@services/form-field.service';
import { DynamicFormComponent } from '../sdwizard/core/dynamic-form/dynamic-form.component';
import { ServiceofferingApiService } from '../services/serviceoffering-api.service';
import { ExpandedFieldsComponent } from '@components/expanded-fields/expanded-fields.component';
import { FormControl } from '@angular/forms';
import { DynamicFormInputComponent } from '@components/dynamic-form-input/dynamic-form-input.component';
import { DynamicFormArrayComponent } from '@components/dynamic-form-array/dynamic-form-array.component';
import { takeWhile } from 'rxjs';

@Component({
  selector: 'app-wizard-extension',
  templateUrl: './wizard-extension.component.html',
  styleUrls: ['./wizard-extension.component.scss']
})
export class WizardExtensionComponent {
  @ViewChild("wizard") private wizard: DynamicFormComponent;
  private ecoSystem: string= "merlot";// pass this to getFiles Api
  protected shaclFile: ShaclFile;
  private filteredShapes: Shape[];

  constructor(private formFieldService: FormfieldControlService,
    private organizationsApiService: OrganizationsApiService,
    private serviceofferingApiService: ServiceofferingApiService) {}

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
      console.log("this here"+this.shaclFile);
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

  public loadShape(shapeName: string, id: string): void {
    if (shapeName === "Participant") {
      this.organizationsApiService.getMerlotParticipantShape().then(shape => {
        this.selectShape(this.formFieldService.readShaclFile(shape), id);
      })
    }
  }

  private createDateTimer: NodeJS.Timer = undefined;


  public prefillFields(selfDescriptionFields: any) {
    this.wizard.finishedLoading
      .pipe(takeWhile(finishedLoading => !finishedLoading, true)) // subscribe until finishedLoading is true for first time (inclusive), then unsubscribe
      .subscribe(finishedLoading => {
      if (!finishedLoading) {
        console.log("Wizard not yet ready, waiting for init.");
      } else {
        console.log("Wizard initialized");
        console.log("start prefillFields")
        for (let expandedField of this.wizard.expandedFieldsViewChildren) {
          this.processExpandedField(expandedField, selfDescriptionFields);
          }
        for (let formInput of this.wizard.formInputViewChildren) {
          this.processFormInput(formInput, selfDescriptionFields);
        }
        for (let formArray of this.wizard.formArrayViewChildren) {
          this.processFormArray(formArray, selfDescriptionFields);
        }
      }
    });
  }

  processFormArray(formArray: DynamicFormArrayComponent, prefillFields: any) {
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

  processFormInput(formInput: DynamicFormInputComponent, prefillFields: any) {
    if (formInput === undefined || prefillFields === undefined) {
      return;
    }

    let fullKey = formInput.input.prefix + ":" + formInput.input.key;

    if (["gax-core:offeredBy", "gax-trust-framework:providedBy"].includes(fullKey)) {
      /*this.subscriptions.add(this.authService.activeOrganizationRole.subscribe(_ => {
        formInput.form.controls[formInput.input.id].patchValue(this.authService.getActiveOrgaLegalName());
      }));
      console.log(this.authService.activeOrganizationRole.observers);*/
      formInput.form.controls[formInput.input.id].disable();
      return;
    } else if (fullKey === "merlot:creationDate") {
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

  processExpandedField(expandedField: ExpandedFieldsComponent, prefillFields: any) {
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

  processExpandedFieldChildrenFields(expandedField: ExpandedFieldsComponent, prefillFields: any) {
    let parentKey = expandedField.input.prefix + ":" + expandedField.input.key;

    // since we are always working with a list of inputs, we need to adapt to that in the prefill as well (even if it is just one element)
    if (!(prefillFields[parentKey] instanceof Array)) {
      prefillFields[parentKey] = [prefillFields[parentKey]];
    }

    let i = 0;
    for (let input of expandedField.inputs) {
      console.log(expandedField);
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
}
