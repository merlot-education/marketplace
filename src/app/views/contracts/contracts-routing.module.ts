import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExploreComponent } from './explore/explore.component';
import { repAuthGuard } from 'src/app/auth.guard';
import { OidcGuard } from 'src/app/oidc.guard';


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
        canActivate: [OidcGuard, repAuthGuard]
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContractsRoutingModule {}

