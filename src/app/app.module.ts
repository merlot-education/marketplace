import { LOCALE_ID, NgModule } from '@angular/core';
import {
  HashLocationStrategy,
  LocationStrategy,
  registerLocaleData,
} from '@angular/common';
import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { WizardAppModule } from './sdwizard/wizardapp.module';
import { WizardExtensionModule } from './wizard-extension/wizard-extension.module';
import { AddActiveRoleHeaderInterceptor } from './services/add-active-role-header.interceptor';
import { AuthorizationInterceptor} from './services/authorization.interceptor';

import { AuthModule, LogLevel } from 'angular-auth-oidc-client';

import {
  PERFECT_SCROLLBAR_CONFIG,
  PerfectScrollbarConfigInterface,
  PerfectScrollbarModule,
} from 'ngx-perfect-scrollbar';

// Import routing module
import { AppRoutingModule } from './app-routing.module';

// Import app component
import { AppComponent } from './app.component';

// Import containers
import { DefaultLayoutComponent } from './containers';

import {
  AvatarModule,
  BadgeModule,
  BreadcrumbModule,
  ButtonGroupModule,
  ButtonModule,
  CardModule,
  DropdownModule,
  FooterModule,
  FormModule,
  GridModule,
  HeaderModule,
  ListGroupModule,
  NavModule,
  ProgressModule,
  SharedModule,
  SidebarModule,
  TabsModule,
  UtilitiesModule,
} from '@coreui/angular';

import { IconModule, IconSetService } from '@coreui/icons-angular';
import { LayoutModule } from '@merlot-education/m-dashboard-ui';

import localeDe from '@angular/common/locales/de';
import { environment } from 'src/environments/environment';

registerLocaleData(localeDe);

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true,
};

const APP_CONTAINERS = [DefaultLayoutComponent];

@NgModule({
  declarations: [AppComponent, ...APP_CONTAINERS],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    AvatarModule,
    BreadcrumbModule,
    FooterModule,
    DropdownModule,
    GridModule,
    HeaderModule,
    SidebarModule,
    IconModule,
    PerfectScrollbarModule,
    NavModule,
    ButtonModule,
    FormModule,
    UtilitiesModule,
    ButtonGroupModule,
    ReactiveFormsModule,
    SidebarModule,
    SharedModule,
    TabsModule,
    ListGroupModule,
    ProgressModule,
    BadgeModule,
    ListGroupModule,
    CardModule,
    HttpClientModule,
    FormsModule,
    WizardAppModule,
    LayoutModule,
    WizardExtensionModule,
    AuthModule.forRoot({
      config: {
        authority: environment.login_authority_url,
        redirectUrl: window.location.origin,
        customParamsCodeRequest: {
          client_secret: 'demo-portal'
        },
        customParamsRefreshTokenRequest: {
          client_secret: 'demo-portal'
        },
        postLogoutRedirectUri: window.location.origin,
        clientId: environment.login_client_id,
        scope: 'openid profile email',
        responseType: 'code',
        silentRenew: true,
        useRefreshToken: true,
        ignoreNonceAfterRefresh: true,
        logLevel: LogLevel.Debug,
        renewTimeBeforeTokenExpiresInSeconds: 60,
      },
    }),
  ],
  providers: [
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy,
    },
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AddActiveRoleHeaderInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthorizationInterceptor,
      multi: true,
    },
    IconSetService,
    Title,
    {provide: LOCALE_ID, useValue: 'de'},
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
