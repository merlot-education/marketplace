import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExploreComponent } from './explore/explore.component';
import { EditComponent } from './edit/edit.component';
import { repAuthGuard } from 'src/app/auth.guard';


const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Service Angebote',
    },
    children: [
      {
        path: 'explore',
        component: ExploreComponent,
        data: {
          title: 'Service Angebote erkunden',
        },
      },
      {
        path: 'edit',
        component: EditComponent,
        data: {
          title: 'Service Angebot erstellen',
        },
        canActivate: [repAuthGuard]
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ServiceofferingsRoutingModule {}

