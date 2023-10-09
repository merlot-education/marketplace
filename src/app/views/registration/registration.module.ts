import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RegistrationRoutingModule } from './registration-routing.module';
import { RegistrationComponent } from './registration.component';
import { AvatarModule, ButtonGroupModule, ButtonModule, CardModule, FormModule, GridModule, NavModule, ProgressModule, TableModule, TabsModule } from '@coreui/angular';
import { IconModule } from '@coreui/icons-angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WidgetsModule } from '../widgets/widgets.module';

@NgModule({
  imports: [
    CardModule,
    RegistrationRoutingModule,
    CommonModule,
    GridModule,
    FormModule,
    FormsModule,
    ButtonModule
  ],
  declarations: [RegistrationComponent]
})
export class RegistrationModule { }
