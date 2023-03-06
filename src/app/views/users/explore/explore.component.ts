import { Component, OnInit } from '@angular/core';
import { DashboardComponent, IUser, users } from '../../dashboard/dashboard.component';

@Component({
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss']
})
export class ExploreComponent implements OnInit {

  users: IUser[] = users;

  constructor() {
  }

  ngOnInit(): void {
  }
}
