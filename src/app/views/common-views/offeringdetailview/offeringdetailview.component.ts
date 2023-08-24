import { Component, Input } from '@angular/core';
import { IOfferings } from '../../serviceofferings/serviceofferings-data';
import { ServiceofferingApiService } from 'src/app/services/serviceoffering-api.service';

@Component({
  selector: 'app-offeringdetailview',
  templateUrl: './offeringdetailview.component.html',
  styleUrls: ['./offeringdetailview.component.scss']
})
export class OfferingdetailviewComponent {

  @Input() protected serviceOfferingData: IOfferings;
  @Input() protected showVariableFields: boolean = true;

  constructor(
    protected serviceOfferingApiService : ServiceofferingApiService) {
  }

}
