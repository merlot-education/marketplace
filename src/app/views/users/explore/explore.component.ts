import { Component, OnInit } from '@angular/core';
import { IUserAuth, IUserData, users } from '../user-data';

@Component({
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss']
})
export class ExploreComponent implements OnInit {

  users: (IUserAuth & IUserData)[] = users;

  constructor() {
  }

  ngOnInit(): void {
  }
}
