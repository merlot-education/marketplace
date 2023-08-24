import { Component, OnInit } from '@angular/core';
import { IOrganizationData } from "../organization-data";
import { AuthService } from 'src/app/services/auth.service';

@Component({
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit {

  protected selectedOrganization: IOrganizationData = null;

  constructor(protected authService: AuthService) {
    authService.activeOrganizationRole.subscribe(orga => {
      this.selectedOrganization = orga.orgaData;
    })
  }

  ngOnInit(): void {
  }
}
