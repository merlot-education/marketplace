import { Component, OnInit } from '@angular/core';
import {IOfferings} from '../serviceofferings-data'
import { ServiceofferingApiService } from '../../../services/serviceoffering-api.service'


@Component({
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss']
})
export class ExploreComponent implements OnInit {

  offerings: IOfferings[] = [];
  orgaOfferings: IOfferings[] = [];
  constructor(protected serviceOfferingApiService : ServiceofferingApiService) {
  }

  ngOnInit(): void {
    this.serviceOfferingApiService.fetchPublicServiceOfferings().then(result => {
      console.log(result)
      this.offerings = result;
    });
    this.serviceOfferingApiService.fetchOrganizationServiceOfferings().then(result => {
      console.log(result)
      this.orgaOfferings = result;
    });
  }
}
