import { Component } from '@angular/core';
import { IContractDetailed } from '../../../contracts-data';
import { IOfferingsDetailed } from 'src/app/views/serviceofferings/serviceofferings-data';
import { ContractApiService } from 'src/app/services/contract-api.service';
import { OrganizationsApiService } from 'src/app/services/organizations-api.service';
import { ServiceofferingApiService } from 'src/app/services/serviceoffering-api.service';

@Component({
  selector: 'app-contractview',
  templateUrl: './contractview.component.html',
  styleUrls: ['./contractview.component.scss']
})
export class ContractviewComponent {

  offeringDetails: IOfferingsDetailed;
  contractDetails: IContractDetailed;

  constructor(
    private contractApiService: ContractApiService,
    protected serviceOfferingApiService: ServiceofferingApiService,
    protected organizationsApiService: OrganizationsApiService) {
  }

  protected saveContract() {

  }

  protected handleEventContractModal(isVisible: boolean) {

  }

}
