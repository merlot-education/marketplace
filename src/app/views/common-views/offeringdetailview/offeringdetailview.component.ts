import { Component, Input } from '@angular/core';
import { IServiceOffering } from '../../serviceofferings/serviceofferings-data';
import { ServiceofferingApiService } from 'src/app/services/serviceoffering-api.service';
import { asGxServiceOfferingCs, asMerlotCoopContractServiceOfferingCs, asMerlotDataDeliveryServiceOfferingCs, 
  asMerlotSaasServiceOfferingCs, asMerlotServiceOfferingCs, getMerlotSpecificServiceOfferingTypeFromServiceOfferingSd, 
  isGxServiceOfferingCs, isMerlotCoopContractServiceOfferingCs, isMerlotDataDeliveryServiceOfferingCs, 
  isMerlotSaasServiceOfferingCs, isMerlotServiceOfferingCs } from 'src/app/utils/credential-tools';

@Component({
  selector: 'app-offeringdetailview',
  templateUrl: './offeringdetailview.component.html',
  styleUrls: ['./offeringdetailview.component.scss']
})
export class OfferingdetailviewComponent {

  @Input() protected serviceOfferingData: IServiceOffering;
  @Input() protected showVariableFields: boolean = true;

  protected getMerlotSpecificServiceOfferingTypeFromServiceOfferingSd = getMerlotSpecificServiceOfferingTypeFromServiceOfferingSd;
  protected isGxServiceOfferingCs = isGxServiceOfferingCs;
  protected asGxServiceOfferingCs = asGxServiceOfferingCs;
  protected isMerlotServiceOfferingCs = isMerlotServiceOfferingCs;
  protected asMerlotServiceOfferingCs = asMerlotServiceOfferingCs;
  
  protected isMerlotSaasServiceOfferingCs = isMerlotSaasServiceOfferingCs;
  protected asMerlotSaasServiceOfferingCs = asMerlotSaasServiceOfferingCs;
  protected isMerlotDataDeliveryServiceOfferingCs = isMerlotDataDeliveryServiceOfferingCs;
  protected asMerlotDataDeliveryServiceOfferingCs = asMerlotDataDeliveryServiceOfferingCs;
  protected isMerlotCoopContractServiceOfferingCs = isMerlotCoopContractServiceOfferingCs;
  protected asMerlotCoopContractServiceOfferingCs = asMerlotCoopContractServiceOfferingCs;

  constructor(
    protected serviceOfferingApiService : ServiceofferingApiService) {
  }
}
