import { Component, OnInit } from '@angular/core';
import { IOrganizationData } from "../organization-data";

@Component({
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit {
  public organizations: IOrganizationData[] = [];

  constructor() {
  }

  ngOnInit(): void {
  }
}
