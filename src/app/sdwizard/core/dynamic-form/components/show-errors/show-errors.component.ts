import {Component, Input, OnInit} from '@angular/core';
import {FormArray, FormControl, FormGroup, ValidationErrors} from '@angular/forms';
import {FormField} from '@models/form-field.model';

@Component({
  selector: 'app-show-errors',
  templateUrl: './show-errors.component.html',
  styleUrls: ['./show-errors.component.scss']
})
export class ShowErrorsComponent implements OnInit {

  @Input() ctrl: FormControl;
  @Input() ctrlAll: FormArray;
  @Input() label: string;
  @Input() displayAll: false;
  @Input() formField: FormField;
  @Input() form: FormGroup = new FormGroup({});

  allErrors: string[] = [];

  ERROR_MESSAGE = {
    required: () => `${this.label} ist erforderlich.`,
    minlength: (par) => `${this.label} darf minimal ${par.requiredLength} Zeichen beinhalten.`,
    maxlength: (par) => `${this.label} darf maximal ${par.requiredLength} Zeichen beinhalten.`,
    min: (par) => `${this.label} muss mindestens ${par.min} sein.`,
    max: (par) => `${this.label} darf maximal ${par.max} sein.`,
    pattern: (par) => `Zulässiges Muster ${par.requiredPattern}`,
    lessthan: (par) => `Der Wert muss niedriger als ${par} sein.`,
    uriPattern: () => `Der Wert muss eine URI sein.`,
    urlPattern: () => `Der Wert muss eine URL sein.`,
    childrenValid: () => `${this.label} ist erforderlich.`
  };

  constructor() {
  }

  ngOnInit(): void {
    if (this.displayAll) {
      this.allErrors = this.listOfAllErrors([], this.formField, this.form);
    }
  }

  shouldShowErrors(): boolean {
    return this.ctrl && this.ctrl.errors && this.ctrl.touched && !(this.ctrl instanceof FormGroup);
  }

  shouldShowShapesErrors(): boolean {
    return this.ctrl && this.ctrl.errors && this.ctrl instanceof FormGroup;
  }

  listOfErrors(): string[] {
    if (this.ctrl && this.ctrl.errors) {
      return Object.keys(this.ctrl.errors).map(
        err => this.ERROR_MESSAGE[err](this.ctrl.getError(err))
      );
    }
  }

  listOfAllErrors(result, formField: FormField, formGroup: FormGroup): string[] {
    if (formField.childrenSchema === '') {
      this.label = formField.name;
      // Get errors when single dynamic input
      const ctrlAll = formGroup.get(formField.id) as FormArray;
      const controlErrors: ValidationErrors = formGroup.get(formField.id).errors;
      if (controlErrors) {
        result.push(Object.keys(controlErrors).map(
          err => this.ERROR_MESSAGE[err](ctrlAll.getError(err))
        ));
      }
      // Get erros when array dynamic input
      const controls = ctrlAll.controls;
      if (controls !== undefined && controls.length > 0) {
        controls.forEach(element => {
          const controlErrorsElement: ValidationErrors = element.errors;
          if (controlErrorsElement) {
            result.push(Object.keys(controlErrorsElement).map(
              err => this.ERROR_MESSAGE[err](element.getError(err))
            ));
          }
        });
      }
    } else {
      if (formField.required) {
        const nestedformGroup = formGroup.get(formField.id) as FormGroup;
        const controlErrors: ValidationErrors = formGroup.get(formField.id).errors;
        if (controlErrors) {
          result.push(Object.keys(controlErrors).map(
            err => this.ERROR_MESSAGE[err](nestedformGroup.getError(err))
          ));
        }
        formField.childrenFields.forEach(childrenField => {
          this.listOfAllErrors(result, childrenField, nestedformGroup);
        });
      }
    }

    return result;
  }

}
