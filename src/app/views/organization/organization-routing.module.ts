import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditComponent } from './edit/edit.component';
import { ExploreComponent } from './explore/explore.component';


const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Organisationsverwaltung',
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
          title: 'Organisationen erkunden',
        },
      },
      {
        path: 'edit',
        component: EditComponent,
        data: {
          title: 'Meine Organisation bearbeiten',
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrganizationRoutingModule {}

