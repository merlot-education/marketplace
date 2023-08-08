import { CommonModule } from '@angular/common';
import {APP_INITIALIZER, NgModule} from '@angular/core';
import {DynamicFormComponent} from './core/dynamic-form/dynamic-form.component';
import {
  DynamicFormInputComponent
} from './core/dynamic-form/components/dynamic-form-input/dynamic-form-input.component';
import {ShowErrorsComponent} from './core/dynamic-form/components/show-errors/show-errors.component';
import {MaterialModule} from './material.module';
import {
  DynamicFormArrayComponent
} from './core/dynamic-form/components/dynamic-form-array/dynamic-form-array.component';
import {NumericDirective} from '@directives/numeric.directive';
import {DynamicFormOrComponent} from './core/dynamic-form/components/dynamic-form-or/dynamic-form-or.component';
import {HttpClientModule} from '@angular/common/http';
import {FormfieldControlService} from '@services/form-field.service';
import {ValidationControlService} from '@services/validation.service';
import {FlexLayoutModule} from '@angular/flex-layout';
import {ExpandedFieldsComponent} from './core/dynamic-form/components/expanded-fields/expanded-fields.component';
import {DatePipe} from '@angular/common';
import {DynamicFormOrArrayComponent} from '@components/dynamic-form-or-array/dynamic-form-or-array.component';
import {
  DynamicSelfLoopsComponent
} from './core/dynamic-form/components/dynamic-self-loops/dynamic-self-loops.component';
import {DynamicFormInComponent} from './core/dynamic-form/components/dynamic-form-in/dynamic-form-in.component';
import {FilesProvider} from '@shared/files-provider';

import { I18nModule } from './i18n/i18n.module';
import { NgxRerenderModule } from 'ngx-rerender';

import { IconModule, IconSetService } from '@coreui/icons-angular';



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


export function filesProviderFactory(provider: FilesProvider) {
  return () => provider.load();
}

@NgModule({
  declarations: [
    DynamicFormComponent,
    DynamicFormInputComponent,
    ShowErrorsComponent,
    DynamicFormArrayComponent,
    NumericDirective,
    DynamicFormOrComponent,
    ExpandedFieldsComponent,
    DynamicFormOrArrayComponent,
    DynamicSelfLoopsComponent,
    DynamicFormInComponent,
  ],
  imports: [
    CommonModule,
    MaterialModule,
    HttpClientModule,
    FlexLayoutModule,
    I18nModule,
    NgxRerenderModule,
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
    ListGroupModule,
    PlaceholderModule,
    ProgressModule,
    SpinnerModule,
    TabsModule,
    NavModule,
    TooltipModule,
    CarouselModule,
    FormModule,
    DropdownModule,
    PaginationModule,
    PopoverModule,
    TableModule,
    IconModule,
  ],
  exports: [
    DynamicFormComponent
  ],
  providers: [FormfieldControlService, ValidationControlService, DatePipe,
    FilesProvider, {provide: APP_INITIALIZER, useFactory: filesProviderFactory, deps: [FilesProvider], multi: true},
    IconSetService,
  ]
})
export class WizardAppModule {

}

