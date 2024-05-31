import { Component, OnInit } from '@angular/core';
import { IUserData } from '../user-data';
import { AaamApiService } from 'src/app/services/aaam-api.service';
import { OrganizationRole } from 'src/app/services/auth.service';
import { ActiveOrganizationRoleService } from 'src/app/services/active-organization-role.service';
import { getParticipantIdFromParticipantSd } from 'src/app/utils/credential-tools';

@Component({
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss'],
})
export class ExploreComponent implements OnInit {
  users: IUserData[] = [];

  constructor(
    protected activeOrgRoleService: ActiveOrganizationRoleService,
    private aaamApiService: AaamApiService
  ) {}

  ngOnInit(): void {
    this.activeOrgRoleService.activeOrganizationRole.subscribe((value) =>
      this.updateUserList(value)
    );
  }

  private updateUserList(activeOrganizationRole: OrganizationRole) {
    this.users = [];
    this.aaamApiService
      .getUsersFromOrganization(
        getParticipantIdFromParticipantSd(activeOrganizationRole.orgaData.selfDescription)
      )
      .then((result) => {
        this.users = result;
      });
  }
}
