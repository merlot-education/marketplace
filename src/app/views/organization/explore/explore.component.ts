import { Component, OnInit } from '@angular/core';
import {AuthService} from "src/app/auth.service"

@Component({
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss']
})
export class ExploreComponent implements OnInit {
  public items = <any>[];

  constructor(
    protected authService: AuthService
  ) {
  }

  ngOnInit(): void {
  }
}
