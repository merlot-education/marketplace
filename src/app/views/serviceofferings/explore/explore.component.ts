import { Component, OnInit } from '@angular/core';
import {IOfferings, IOfferingsDetailed} from '../serviceofferings-data'
import { ServiceofferingApiService } from '../../../services/serviceoffering-api.service'
import { OrganizationsApiService } from 'src/app/services/organizations-api.service';
import { AuthService } from 'src/app/services/auth.service';
import { ShaclFile } from '@models/shacl-file';
import { FormfieldControlService } from '@services/form-field.service';
import { Shape } from '@models/shape';
import { serviceFileNameDict } from '../serviceofferings-data';


@Component({
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss']
})
export class ExploreComponent implements OnInit {

  objectKeys = Object.keys;

  offerings: IOfferings[] = [];
  orgaOfferings: IOfferings[] = [];
  filteredOrgaOfferings: IOfferings[] = []
  shaclFile: ShaclFile = undefined;
  filteredShapes: Shape[];

  protected friendlyStatusNames = {
    "IN_DRAFT": "In Bearbeitung",
    "RELEASED": "Veröffentlicht",
    "REVOKED": "Widerrufen",
    "DELETED": "Gelöscht",
    "ARCHIVED": "Archiviert"
  }

  selectedStatusFilter: string = Object.keys(this.friendlyStatusNames)[0];
  applyStatusFilter: boolean = false;
  emptyOfferingDetails: IOfferingsDetailed = {
    description: '',
    modifiedDate: '',
    dataAccessType: '',
    exampleCosts: '',
    attachments: [],
    termsAndConditions: [],
    runtimeOption: [],
    id: '',
    sdHash: '',
    creationDate: '',
    offeredBy: '',
    merlotState: '',
    type: '',
    name: ''
  };

  selectedOfferingDetails: IOfferingsDetailed = this.emptyOfferingDetails;
  selectedOfferingPublic: boolean = false;

  constructor(
    protected serviceOfferingApiService : ServiceofferingApiService,
    private organizationsApiService: OrganizationsApiService,
    protected authService: AuthService,
    private formFieldService: FormfieldControlService) {
  }

  ngOnInit(): void {
    this.authService.activeOrganizationRole.subscribe(value => this.refreshOfferings());
  }

  private refreshOfferings() {
    if (this.selectedOfferingDetails !== this.emptyOfferingDetails) {
      this.requestDetails(this.selectedOfferingDetails.id);
    }

    this.serviceOfferingApiService.fetchPublicServiceOfferings().then(result => {
      console.log(result)
      this.offerings = result;
    });
    this.serviceOfferingApiService.fetchOrganizationServiceOfferings().then(result => {
      console.log(result)
      this.orgaOfferings = result;
    });
  }

  protected filterByStatus(applyFilter: boolean, status: string) {
    if (applyFilter) {
      console.log("filter by ", status);
      this.filteredOrgaOfferings = [];
      for (let offering of this.orgaOfferings) {
        if (offering.merlotState === status) {
          this.filteredOrgaOfferings.push(offering);
        }
      }
    }
  }

  protected resolveOrganizationLegalName(offeredByString: string): string {
    let result = this.organizationsApiService.getOrgaById(offeredByString.replace("Participant:", ""))?.organizationLegalName;
    return result ? result : "Unbekannt";
  }

  protected resolveMerlotStatusFriendlyName(merlotStatusString: string): string {
    
    return this.friendlyStatusNames[merlotStatusString] ? this.friendlyStatusNames[merlotStatusString] : "Unbekannt";
  }

  protected resolveTypeFriendlyName(merlotType: string) : string {
    for (let key in serviceFileNameDict) {
      if (serviceFileNameDict[key].type === merlotType) {
        return serviceFileNameDict[key].name;
      }
    }
    return undefined;
  }

  protected async requestDetails(id: string) {
    this.selectedOfferingDetails = this.emptyOfferingDetails;
    await this.serviceOfferingApiService.fetchServiceOfferingDetails(id).then(result => {
      this.selectedOfferingDetails = result;
    });
  }

  releaseOffering(id: string) {
    this.serviceOfferingApiService.releaseServiceOffering(id).then(result => {
      console.log(result);
      this.refreshOfferings();
    });
  }

  revokeOffering(id: string) {
    this.serviceOfferingApiService.revokeServiceOffering(id).then(result => {
      console.log(result);
      this.refreshOfferings();
    });
  }

  inDraftOffering(id: string) {
    this.serviceOfferingApiService.inDraftServiceOffering(id).then(result => {
      console.log(result);
      this.refreshOfferings();
    });
  }
  
  deleteOffering(id: string) {
    this.serviceOfferingApiService.deleteServiceOffering(id).then(result => {
      console.log(result);
      this.refreshOfferings();
    });
  }
  findFilenameByShapeType(shapeType: string): string {
    for (let file in serviceFileNameDict) {
      if (serviceFileNameDict[file].type === shapeType) {
        return file;
      }
    }
    return undefined;
  }

  updateServiceOfferingEdit(offering: IOfferings) {
    this.requestDetails(offering.id).then(() => {
      this.select(this.findFilenameByShapeType(offering.type));
    });
    
  }

  select(name: string): void {
    this.serviceOfferingApiService.fetchShape(name).subscribe(
      res => {
        this.shaclFile = this.formFieldService.readShaclFile(res);
        this.filteredShapes = this.formFieldService.updateFilteredShapes(this.shaclFile);
        if (this.filteredShapes.length > 1) {
          console.log("too many shapes selected");
        }
        else {
          console.log("this here"+this.shaclFile);
          console.table(this.shaclFile);
          //set description.input value depending on language
          this.updateSelectedShape();
          //this.router.navigate(['/service-offerings/edit/form'], { state: { file: this.shaclFile } });
        }
      }
    );
  }

  updateSelectedShape(): void {
    const shape = this.filteredShapes[0];
    if (shape !== undefined) {
      this.shaclFile.shapes.find(x => x.name === shape.name).selected = true;
    }
  }
}
