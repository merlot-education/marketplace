import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MerlotComponent } from './merlot/merlot.component';


const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Was ist der MERLOT Marktplatz? ',
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
          title: 'Über MERLOT',
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

