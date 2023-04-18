import { Component, OnInit } from '@angular/core';
import { OrganizationData, orgaData } from "../organization-data";


@Component({
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss']
})
export class ExploreComponent implements OnInit {
  public organizations: OrganizationData[] = orgaData;

  constructor(
  ) {
  }

  ngOnInit(): void {
    
  }
}
