import { Component, OnInit } from '@angular/core';

export interface IOfferings {
  name: string,
  country: string,
  provider: string,
  availablesince: string,
}

@Component({
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss']
})
export class ExploreComponent implements OnInit {

  offerings: IOfferings[] = [
    {
      name: "DataOffering1",
      country: "De",
      provider: "ProviderCorp",
      availablesince: "Jan 1, 2021"
    },
    {
      name: "DataOffering2",
      country: "De",
      provider: "ProviderCorp",
      availablesince: "Jan 1, 2021"
    },
    {
      name: "SmartServiceOffering1",
      country: "De",
      provider: "ProviderCorp",
      availablesince: "Jan 1, 2021"
    }
  ]

  constructor() {
  }

  ngOnInit(): void {
  }
}
