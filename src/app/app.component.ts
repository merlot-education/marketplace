import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { IconSetService } from '@coreui/icons-angular';
import { iconSubset } from './icons/icon-subset';
import { Title } from '@angular/platform-browser';
import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
})
export class AppComponent implements OnInit {
  title = 'MERLOT Portal';

  private authCodeFlowConfig: AuthConfig = {
    // Url of the Identity Provider
    issuer: 'https://auth-service.dev.merlot-education.eu',
  
    // URL of the SPA to redirect the user to after login
    redirectUri: window.location.origin,
  
    // The SPA's id. The SPA is registerd with this id at the auth-server
    // clientId: 'server.code',
    clientId: 'MPO',
  
    // Just needed if your auth server demands a secret. In general, this
    // is a sign that the auth server is not configured with SPAs in mind
    // and it might not enforce further best practices vital for security
    // such applications.
    // dummyClientSecret: 'secret',
  
    responseType: 'code',
  
    // set the scope for the permissions the client should request
    // The first four are defined by OIDC.
    // Important: Request offline_access to get a refresh token
    // The api scope is a usecase specific one
    scope: 'openid profile email',
  
    showDebugInformation: true,
  };
  
  private initializeOAuth() {
    this.oauthService.initCodeFlow();
    this.oauthService.configure(this.authCodeFlowConfig);
    this.oauthService
    //this.oauthService.loadDiscoveryDocument();
  }
  

  constructor(
    private router: Router,
    private titleService: Title,
    private iconSetService: IconSetService,
    private oauthService: OAuthService
  ) {
    titleService.setTitle(this.title);
    // iconSet singleton
    iconSetService.icons = { ...iconSubset };
    this.initializeOAuth();
  }

  ngOnInit(): void {
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
    });
  }
}
