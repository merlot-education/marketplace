import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WizardExtensionComponent } from './wizard-extension.component';
import { WizardAppModule } from '../sdwizard/wizardapp.module';
import { CommonViewsModule } from "../views/common-views/common-views.module";
import { ButtonGroupModule, ButtonModule, GridModule, ModalModule } from '@coreui/angular';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
    declarations: [WizardExtensionComponent],
    exports: [
        WizardExtensionComponent
    ],
    imports: [
        CommonModule,
        WizardAppModule,
        CommonViewsModule,
        FlexLayoutModule,
        ButtonModule,
        ButtonGroupModule,
        FormsModule,
        GridModule,
        ModalModule
    ]
})
export class WizardExtensionModule { }
