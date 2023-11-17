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

@NgModule({
  imports: [
    CardModule,
    RegistrationRoutingModule,
    CommonModule,
    GridModule,
    FormModule,
    FormsModule,
    ButtonModule,

    CardComponent,
  ],
  declarations: [RegistrationComponent],
})
export class RegistrationModule {}
