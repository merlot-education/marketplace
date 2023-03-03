import { Component, OnInit } from '@angular/core';
import { OrganizationData, orgaData } from "../organization-data";

@Component({
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit {
  public organizations: OrganizationData[] = orgaData;

  constructor() {
  }

  ngOnInit(): void {
  }
}
