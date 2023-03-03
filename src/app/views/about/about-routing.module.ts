import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MerlotComponent } from './merlot/merlot.component';


const routes: Routes = [
  {
    path: '',
    data: {
      title: 'About MERLOT',
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'cards',
      },
      {
        path: 'merlot',
        component: MerlotComponent,
        data: {
          title: 'MERLOT Marketplace',
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AboutRoutingModule {}

