import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WizardExtensionComponent } from './wizard-extension.component';
import { WizardAppModule } from '../sdwizard/wizardapp.module';
import { CommonViewsModule } from "../views/common-views/common-views.module";
import { ButtonGroupModule, ButtonModule } from '@coreui/angular';

@NgModule({
    declarations: [WizardExtensionComponent],
    exports: [
        WizardExtensionComponent
    ],
    imports: [
        CommonModule,
        WizardAppModule,
        CommonViewsModule,
        ButtonModule,
        ButtonGroupModule,
    ]
})
export class WizardExtensionModule { }
