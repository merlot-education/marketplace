import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ExploreComponent } from './explore/explore.component';
import { EditComponent } from './edit/edit.component';

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
  UtilitiesModule
} from '@coreui/angular';

import { IconModule } from '@coreui/icons-angular';

// // utils
import { DocsComponentsModule } from '@docs-components/docs-components.module';

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
import { ServiceofferingsRoutingModule } from './serviceofferings-routing.module';

@NgModule({
  imports: [
    CommonModule,
    ServiceofferingsRoutingModule,
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
    ReactiveFormsModule,
    DropdownModule,
    PaginationModule,
    PopoverModule,
    TableModule,
    DocsComponentsModule,
  ],
  declarations: [
    ExploreComponent,
    EditComponent
  ],
})
export class ServiceofferingsModule {}
