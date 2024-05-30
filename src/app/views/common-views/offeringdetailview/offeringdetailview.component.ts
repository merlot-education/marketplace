import { Component, Input } from '@angular/core';
import { IServiceOffering } from '../../serviceofferings/serviceofferings-data';
import { ServiceofferingApiService } from 'src/app/services/serviceoffering-api.service';

@Component({
  selector: 'app-offeringdetailview',
  templateUrl: './offeringdetailview.component.html',
  styleUrls: ['./offeringdetailview.component.scss']
})
export class OfferingdetailviewComponent {

  @Input() protected serviceOfferingData: IServiceOffering;
  @Input() protected showVariableFields: boolean = true;

  constructor(
    protected serviceOfferingApiService : ServiceofferingApiService) {
  }
}
