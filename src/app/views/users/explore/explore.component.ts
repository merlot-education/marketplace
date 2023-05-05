import { Component, OnInit } from '@angular/core';
import { IUserData } from '../user-data';
import { AaamApiService } from 'src/app/services/aaam-api.service';
import { AuthService } from 'src/app/services/auth.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss'],
})
export class ExploreComponent implements OnInit {
  users: IUserData[] = [];

  constructor(
    protected authService: AuthService,
    private aaamApiService: AaamApiService
  ) {}

  ngOnInit(): void {
    this.authService.activeOrganizationRole.subscribe((value) =>
      this.updateUserList(value)
    );
  }

  private updateUserList(activeOrganizationRole: string) {
    this.users = [];
    this.aaamApiService
      .getUsersFromOrganization(
        this.authService.getOrganizationRole(activeOrganizationRole).orgaId
      )
      .then((result) => {
        this.users = result;
      });
  }
}
