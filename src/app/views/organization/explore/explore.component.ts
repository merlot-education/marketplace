import { Component, OnInit } from '@angular/core';
import { OrganizationData } from "../organization-data";
import { OrganizationsApiService } from 'src/app/services/organizations-api.service';
import { AuthService } from 'src/app/services/auth.service';


@Component({
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss']
})
export class ExploreComponent implements OnInit {
  public organizations: OrganizationData[] = [];

  constructor(
    private organizationsApiService: OrganizationsApiService,
    private authService: AuthService,
  ) {
  }

  ngOnInit(): void {
    this.organizationsApiService.organizations.subscribe((value) => this.organizations = value);
  }

  checkRepresentant(organization: OrganizationData): string {
    if (organization.activeRepresentant) {
      return " - Aktiver Repräsentant";
    } else if (organization.passiveRepresentant) {
      return " - Passiver Repräsentant";
    } else {
      return "";
    }
  }
}
