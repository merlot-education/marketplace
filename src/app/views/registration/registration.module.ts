import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RegistrationRoutingModule } from './registration-routing.module';
import { RegistrationComponent } from './registration.component';
import {
  ButtonModule,
  CardModule,
  FormModule,
  GridModule,
} from '@coreui/angular';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '@merlot-education/m-basic-ui';
import { CommonViewsModule } from "../common-views/common-views.module";

@NgModule({
    declarations: [RegistrationComponent],
    imports: [
        CardModule,
        RegistrationRoutingModule,
        CommonModule,
        GridModule,
        FormModule,
        FormsModule,
        ButtonModule,
        CardComponent,
        CommonViewsModule
    ]
})
export class RegistrationModule {}
