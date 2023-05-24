import { Component, NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DynamicFormComponent } from './core/dynamic-form/dynamic-form.component';
import { FileUploadComponent } from './core/file-upload/component/file-upload.component';
import { HomepageComponent } from './core/homepage/homepage.component';
import { SelectFileComponent } from './core/select-file/select-file.component';
import { SelectShapeComponent } from './core/select-shape/select-shape.component';
import { StartingPageComponent } from './core/starting-page/starting-page.component';

const routes: Routes = [

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { 
}
