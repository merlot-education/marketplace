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

import { PagesRoutingModule } from './pages-routing.module';
import { Page404Component } from './page404/page404.component';
import { Page500Component } from './page500/page500.component';
import {
  ButtonModule,
  CardModule,
  FormModule,
  GridModule,
} from '@coreui/angular';
import { IconModule } from '@coreui/icons-angular';
import { CardComponent } from '@merlot-education/m-basic-ui';

@NgModule({
  declarations: [
    Page404Component,
    Page500Component,
  ],
  imports: [
    CommonModule,
    PagesRoutingModule,
    CardModule,
    ButtonModule,
    GridModule,
    IconModule,
    FormModule,
    CardComponent,
  ],
})
export class PagesModule {}
