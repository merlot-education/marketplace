import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditComponent } from './edit/edit.component';
import { ExploreComponent } from './explore/explore.component';
import { ImportComponent } from './import/import.component';
import { fedAuthGuard, fedOrgaEditAuthGuard, isAuthenticated, repAuthGuard } from 'src/app/auth.guard';


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
          title: 'Organisation bearbeiten',
        },
        canActivate: [isAuthenticated, repAuthGuard]
      },
      {
        path: 'edit/:orgaId',
        component: EditComponent,
        data: {
          title: 'Organisation bearbeiten',
        },
        canActivate: [isAuthenticated, fedOrgaEditAuthGuard]
      },
      {
        path: 'import', 
        component: ImportComponent,
        data: {
          title: 'Organisation hinzufügen',
        },
        canActivate: [isAuthenticated, fedAuthGuard]
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrganizationRoutingModule {}

