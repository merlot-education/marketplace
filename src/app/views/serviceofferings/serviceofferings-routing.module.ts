import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExploreComponent } from './explore/explore.component';
import { EditComponent } from './edit/edit.component';


const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Manage Service Offerings',
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'cards',
      },
      {
        path: 'explore',
        component: ExploreComponent,
        data: {
          title: 'Explore Service Offerings',
        },
      },
      {
        path: 'edit',
        component: EditComponent,
        data: {
          title: 'Edit Service Offerings',
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ServiceofferingsRoutingModule {}

