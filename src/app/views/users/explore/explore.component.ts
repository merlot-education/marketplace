import { Component, OnInit } from '@angular/core';
import { IUserData } from '../user-data';
import { AaamApiService } from 'src/app/aaam-api.service';
import { AuthService } from 'src/app/auth.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss'],
})
export class ExploreComponent implements OnInit {
  users: IUserData[] = [];

  constructor(
    private authService: AuthService,
    private aaamApiService: AaamApiService
  ) {}

  ngOnInit(): void {
    this.authService.activeOrganizationRole.subscribe((value) =>
      this.updateUserList(value)
    );
  }

  private updateUserList(activeOrganizationRole: string) {
    this.aaamApiService
      .getUsersFromOrganization(
        activeOrganizationRole.split('_').slice(1).join()
      )
      .then((result) => {
        this.users = result;
      });
  }
}
