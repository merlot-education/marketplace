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

// // views
// import { AccordionsComponent } from './accordion/accordions.component';
// import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
// import { CardsComponent } from './cards/cards.component';
// import { CarouselsComponent } from './carousels/carousels.component';
// import { CollapsesComponent } from './collapses/collapses.component';
// import { ListGroupsComponent } from './list-groups/list-groups.component';
// import { NavsComponent } from './navs/navs.component';
// import { PaginationsComponent } from './paginations/paginations.component';
// import { PlaceholdersComponent } from './placeholders/placeholders.component';
// import { PopoversComponent } from './popovers/popovers.component';
// import { ProgressComponent } from './progress/progress.component';
// import { SpinnersComponent } from './spinners/spinners.component';
// import { TablesComponent } from './tables/tables.component';
// import { TooltipsComponent } from './tooltips/tooltips.component';
// import { TabsComponent } from './tabs/tabs.component';

// Components Routing
import { ContractsRoutingModule } from './contracts-routing.module';
import { CommonViewsModule } from '../common-views/common-views.module';
import {
  CardComponent,
  GridComponent,
  PaginatorComponent,
} from '@merlot-education/m-basic-ui';

@NgModule({
  declarations: [ExploreComponent],
  imports: [
    CommonModule,
    CommonViewsModule,
    ContractsRoutingModule,
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
    ModalModule,
    PaginatorComponent,

    GridComponent,
    CardComponent,
  ],
})
export class ContractsModule {}
