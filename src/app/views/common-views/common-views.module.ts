import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationModule } from '@coreui/angular';
import { PagingFooterComponent } from './paging-footer/paging-footer.component'



@NgModule({
  declarations: [PagingFooterComponent],
  imports: [
    CommonModule,
    PaginationModule
  ],
  exports: [
    PagingFooterComponent
  ]
})
export class CommonViewsModule { }
