import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExploreComponent } from './explore/explore.component';


const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Meine Verträge',
    },
    children: [
      {
        path: 'explore',
        component: ExploreComponent,
        data: {
          title: 'Meine Verträge erkunden',
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContractsRoutingModule {}

