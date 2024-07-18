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
import { ContractviewComponent } from './contractview/contractview.component';
import { OfferingdetailviewComponent } from './offeringdetailview/offeringdetailview.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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
import { StatusMessageComponent } from './status-message/status-message.component';
import { ProviderContractConfigComponent } from './contractview/contractconfig/provider-contract-config/provider-contract-config.component';
import { ConsumerContractConfigComponent } from './contractview/contractconfig/consumer-contract-config/consumer-contract-config.component';
import { CommonContractConfigComponent } from './contractview/contractconfig/common-contract-config/common-contract-config.component';
import { KtcLinkComponent } from './ktc-link/ktc-link.component';
import { CardComponent } from '@merlot-education/m-basic-ui';

@NgModule({
  declarations: [ContractviewComponent, OfferingdetailviewComponent, StatusMessageComponent, ProviderContractConfigComponent, ConsumerContractConfigComponent, CommonContractConfigComponent, KtcLinkComponent],
  imports: [
    CommonModule,
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
    CardComponent,
  ],
  exports: [ContractviewComponent, OfferingdetailviewComponent, StatusMessageComponent, KtcLinkComponent],
})
export class CommonViewsModule {}
