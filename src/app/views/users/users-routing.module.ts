import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExploreComponent } from './explore/explore.component';


const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Benutzerverwaltung',
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
          title: 'Nutzer meiner Organisation anzeigen',
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsersRoutingModule {}

