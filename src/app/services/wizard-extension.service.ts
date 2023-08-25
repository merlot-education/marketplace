import { Injectable } from '@angular/core';
import { FormField } from '@models/form-field.model';

@Injectable({
  providedIn: 'root'
})
export class WizardExtensionService {

  constructor() { }

  public prefillFields(formFields: FormField[], selfDescriptionFields: any) {
    // create map from field names to field in prefillData
    let prefillFieldDict: {[fieldKey: string] : any} = {};
    for (let f_key in selfDescriptionFields) {
      prefillFieldDict[f_key.split(":")[1]] = selfDescriptionFields[f_key];
    }

    let additionalFields = [];

    // check fields in shape and fill them if possible
    for (let f of formFields) {
      if (f.key in prefillFieldDict) { // check if we have the field in our prefill data
        if (f.key === "street-address") {
          console.log(f);
          console.log(prefillFieldDict[f.key]);
        }
        if (f.componentType === "dynamicFormInput") { // any basic data type
          f.value = this.unpackValueFromField(prefillFieldDict[f.key]);
        } else if (f.componentType === "dynamicFormArray") {  // array of primitives
          // even if the field is an array, we need to check if the prefill data is also an array and wrap it if not
          let values = this.unpackValueFromField(prefillFieldDict[f.key]);
          if (values instanceof Array) {
            f.values = this.unpackValueFromField(prefillFieldDict[f.key]);
          } else {
            f.values = [this.unpackValueFromField(prefillFieldDict[f.key])];
          }
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
}
