import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DefaultLayoutComponent } from './containers';
import { Page404Component } from './views/pages/page404/page404.component';
import { Page500Component } from './views/pages/page500/page500.component';
import { KeycloakGuard } from './keycloak.guard'
import { fedAuthGuard, repAuthGuard } from './auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'start',
    pathMatch: 'full'
  },
  {
    path: '',
    component: DefaultLayoutComponent,
    data: {
      title: 'Home'
    },
    children: [
      {
        path: 'start',
        loadChildren: () =>
          import('./views/dashboard/dashboard.module').then((m) => m.DashboardModule)
      },
      {
        path: 'registration',
        loadChildren: () =>
          import('./views/registration/registration.module').then((m) => m.RegistrationModule)
      },
      {
        path: 'organization',
        loadChildren: () =>
          import('./views/organization/organization.module').then((m) => m.OrganizationModule),
      },
      {
        path: 'about',
        loadChildren: () =>
          import('./views/about/about.module').then((m) => m.AboutModule)
      },
      {
        path: 'users',
        loadChildren: () =>
          import('./views/users/users.module').then((m) => m.UsersModule),
          canActivate: [KeycloakGuard, repAuthGuard]
      },
      {
        path: 'service-offerings',
        loadChildren: () =>
          import('./views/serviceofferings/serviceofferings.module').then((m) => m.ServiceofferingsModule)
      },
      {
        path: 'contracts',
        loadChildren: () =>
          import('./views/contracts/contracts.module').then((m) => m.ContractsModule),
          canActivate: [KeycloakGuard, repAuthGuard]
      },
      {
        path: 'pages',
        loadChildren: () =>
          import('./views/pages/pages.module').then((m) => m.PagesModule)
      },
    ],
  },
  {
    path: '404',
    component: Page404Component,
    data: {
      title: 'Page 404'
    }
  },
  {
    path: '500',
    component: Page500Component,
    data: {
      title: 'Page 500'
    }
  },
  {path: '**', redirectTo: 'start'}
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'top',
      anchorScrolling: 'enabled',
      initialNavigation: 'enabledBlocking'
      // relativeLinkResolution: 'legacy'
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
