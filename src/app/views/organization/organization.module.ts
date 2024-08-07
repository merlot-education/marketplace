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

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ExploreComponent } from './explore/explore.component';
import { NgxJsonViewerModule } from 'ngx-json-viewer';

// CoreUI Modules
import {
  AccordionModule,
  BadgeModule,
  BreadcrumbModule,
  ButtonModule,
  CardModule,
  CarouselModule,
  CollapseModule,
  DropdownModule,
  FormModule,
  GridModule,
  ListGroupModule,
  NavModule,
  PaginationModule,
  PlaceholderModule,
  PopoverModule,
  ProgressModule,
  SharedModule,
  SpinnerModule,
  TableModule,
  TabsModule,
  TooltipModule,
  UtilitiesModule,
  ModalModule,
} from '@coreui/angular';

import { IconModule } from '@coreui/icons-angular';

// Components Routing
import { OrganizationRoutingModule } from './organization-routing.module';
import { EditComponent } from './edit/edit.component';
import { WizardAppModule } from '../../sdwizard/wizardapp.module';
import { CommonViewsModule } from '../common-views/common-views.module';
import { ImportComponent } from './import/import.component';
import { CardComponent, GridComponent, PaginatorComponent } from '@merlot-education/m-basic-ui';
import { WizardExtensionModule } from 'src/app/wizard-extension/wizard-extension.module';

@NgModule({
  imports: [
    CommonModule,
    CommonViewsModule,
    OrganizationRoutingModule,
    AccordionModule,
    BadgeModule,
    BreadcrumbModule,
    ButtonModule,
    CardModule,
    CollapseModule,
    GridModule,
    UtilitiesModule,
    SharedModule,
    ListGroupModule,
    IconModule,
    ListGroupModule,
    PlaceholderModule,
    ProgressModule,
    SpinnerModule,
    TabsModule,
    NavModule,
    TooltipModule,
    CarouselModule,
    FormModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownModule,
    PaginationModule,
    PopoverModule,
    TableModule,
    WizardAppModule,
    CardComponent,
    GridComponent,
    PaginatorComponent,
    WizardExtensionModule,
    NgxJsonViewerModule,
    ModalModule
  ],
  declarations: [ExploreComponent, EditComponent, ImportComponent],
})
export class OrganizationModule {}
