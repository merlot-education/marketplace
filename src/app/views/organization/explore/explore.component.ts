import { Component, OnInit } from '@angular/core';
import {AuthService} from "src/app/auth.service"


interface organizationData {
  merlotId: string,
  registrationNumber: string,
  registrationType: string,
  name: string,
  countryCode: string,
  postalCode: string,
  street: string,
  iconName: string,
}

@Component({
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss']
})
export class ExploreComponent implements OnInit {
  public organizations: organizationData[] = [
    {
      name: "Gaia-X European Association for Data and Cloud AISBL",
      merlotId: "000001",
      registrationNumber: "0762747721",
      registrationType: "local",
      countryCode: "BE",
      postalCode: "12345",
      street: "asdasd",
      iconName: "cil-aperture"
    },
    {
      name: "Dataport AöR",
      merlotId: "000002",
      registrationNumber: "",
      registrationType: "local",
      countryCode: "D",
      postalCode: "24161 Altenholz",
      street: "Altenholzer Straße 10-14",
      iconName: "cil-bank"
    }
  ];

  constructor() {
  }

  ngOnInit(): void {
  }
}
