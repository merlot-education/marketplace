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
import { ProviderContractConfigComponent } from './contractview/contractconfig/provider/provider-contract-config/provider-contract-config.component';
import { ConsumerContractConfigComponent } from './contractview/contractconfig/consumer/consumer-contract-config/consumer-contract-config.component';
import { CommonContractConfigComponent } from './contractview/contractconfig/common/common-contract-config/common-contract-config.component';

@NgModule({
  declarations: [ContractviewComponent, OfferingdetailviewComponent, StatusMessageComponent, ProviderContractConfigComponent, ConsumerContractConfigComponent, CommonContractConfigComponent],
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
  ],
  exports: [ContractviewComponent, OfferingdetailviewComponent, StatusMessageComponent],
})
export class CommonViewsModule {}
