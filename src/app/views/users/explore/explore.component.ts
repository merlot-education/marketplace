/*
 *  Copyright 2024 Dataport. All rights reserved. Developed as part of the MERLOT project.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

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
