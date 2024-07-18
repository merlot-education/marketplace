/*
 *  Copyright 2024 Dataport. All rights reserved. Developed as part of the MERLOT project.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  ButtonModule,
  CardModule,
  DropdownModule,
  GridModule,
  ProgressModule,
  SharedModule,
  WidgetModule
} from '@coreui/angular';
import { IconModule } from '@coreui/icons-angular';
import { ChartjsModule } from '@coreui/angular-chartjs';

import { DocsComponentsModule } from '@docs-components/docs-components.module';

import { WidgetsRoutingModule } from './widgets-routing.module';
import { WidgetsComponent } from './widgets/widgets.component';
import { WidgetsBrandComponent } from './widgets-brand/widgets-brand.component';
import { ChartSample, WidgetsDropdownComponent } from './widgets-dropdown/widgets-dropdown.component';
import { WidgetsEComponent } from './widgets-e/widgets-e.component';

@NgModule({
  declarations: [
    WidgetsComponent,
    WidgetsBrandComponent,
    WidgetsDropdownComponent,
    ChartSample,
    WidgetsEComponent
  ],
  imports: [
    CommonModule,
    WidgetsRoutingModule,
    GridModule,
    WidgetModule,
    IconModule,
    DropdownModule,
    SharedModule,
    ButtonModule,
    CardModule,
    DocsComponentsModule,
    ProgressModule,
    ChartjsModule
  ],
  exports: [
    WidgetsBrandComponent,
    WidgetsDropdownComponent
  ]
})
export class WidgetsModule {
}
