import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WizardExtensionComponent } from './wizard-extension.component';
import { WizardAppModule } from '../sdwizard/wizardapp.module';

@NgModule({
  declarations: [ WizardExtensionComponent ],
  imports: [
    CommonModule,
    WizardAppModule
  ],
  exports: [
    WizardExtensionComponent
  ]
})
export class WizardExtensionModule { }
