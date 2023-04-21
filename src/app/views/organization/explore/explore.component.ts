import { Component, OnInit } from '@angular/core';
import { OrganizationData } from "../organization-data";
import { OrganizationsApiService } from 'src/app/organizations-api.service';
import { AuthService } from 'src/app/auth.service';


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
    this.organizationsApiService.getOrganizations().then(result => this.organizations = result);
    this.authService.activeOrganizationRole.subscribe((value) => {
      for (let orga of this.organizations) {
        if(orga.merlotId == value.split("_")[1]) {  // TODO change this
          orga.activeRepresentant = true;
        }
      }
    })
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
