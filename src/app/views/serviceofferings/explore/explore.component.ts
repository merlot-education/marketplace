import { Component, OnInit, ViewChild } from '@angular/core';
import {IOfferings, IOfferingsDetailed} from '../serviceofferings-data'
import { ServiceofferingApiService } from '../../../services/serviceoffering-api.service'
import { OrganizationsApiService } from 'src/app/services/organizations-api.service';
import { AuthService } from 'src/app/services/auth.service';
import { ShaclFile } from '@models/shacl-file';
import { FormfieldControlService } from '@services/form-field.service';
import { Shape } from '@models/shape';
import { serviceFileNameDict } from '../serviceofferings-data';
import { DynamicFormComponent } from 'src/app/sdwizard/core/dynamic-form/dynamic-form.component';

interface IPageOption {
  target: number;
  text: string;
  disabled: boolean;
  active: boolean;
}

@Component({
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss']
})
export class ExploreComponent implements OnInit {

  @ViewChild(DynamicFormComponent, {static: false}) childRef: DynamicFormComponent;

  readonly ITEMS_PER_PAGE = 9;

  objectKeys = Object.keys;

  offerings: IOfferings[] = [];
  orgaOfferings: IOfferings[] = [];
  shaclFile: ShaclFile = undefined;
  filteredShapes: Shape[];


  protected publicOfferingPages: IPageOption[] = []

  protected orgaOfferingPages: IPageOption[] = []

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

  private isFiltered: boolean = false;

  constructor(
    protected serviceOfferingApiService : ServiceofferingApiService,
    protected organizationsApiService: OrganizationsApiService,
    protected authService: AuthService,
    private formFieldService: FormfieldControlService) {
  }

  ngOnInit(): void {
    this.authService.activeOrganizationRole.subscribe(value => this.refreshOfferings());
  }

  protected handlePublicPageNavigation(option: IPageOption) {
    if (option.active) {
      return;
    }

    console.log(option);
    this.refreshPublicOfferings(option.target, this.ITEMS_PER_PAGE);
  }

  protected handleOrgaPageNavigation(option: IPageOption) {
    if (option.active) {
      return;
    }

    console.log(option);
    this.refreshOrgaOfferings(option.target, this.ITEMS_PER_PAGE);
  }

  private updatePageNavigationOptions(activePage: number, totalPages: number): IPageOption[] {
    let target = [{
      target: 0,
      text: "Anfang",
      disabled: activePage === 0,
      active: false,
    }];
    
    let startIndex;
    if (activePage > 0) {
      startIndex = activePage === (totalPages-1) ? Math.max(0, (activePage-2)) : (activePage-1);
    } else {
      startIndex = activePage;
    }

    for (let i = startIndex; i < Math.min(startIndex + 3, totalPages); i++) {
      target.push({
        target: i,
        text: "" + (i+1),
        disabled: false,
        active: activePage === i,
      })
    }

    target.push({
        target: totalPages-1,
        text: "Ende",
        disabled: activePage === (totalPages-1),
        active: false,
    })
    return target;
  }

  protected handleEventEditModal(modalVisible: boolean) {
    if (!modalVisible) {
      this.selectedOfferingDetails = this.emptyOfferingDetails;
      this.childRef.ngOnDestroy();
      this.refreshOfferings();
    }
  }

  protected handleEventDetailsModal(modalVisible: boolean) {
    if (!modalVisible) {
      this.selectedOfferingDetails = this.emptyOfferingDetails;
    }
  }

  protected handleEventContractModal(modalVisible: boolean) {
    if (!modalVisible) {
      this.selectedOfferingDetails = this.emptyOfferingDetails;
    }
  }

  private refreshOfferings() {
    if (this.selectedOfferingDetails !== this.emptyOfferingDetails) {
      this.requestDetails(this.selectedOfferingDetails.id);
    }
    this.refreshPublicOfferings(0, this.ITEMS_PER_PAGE);
    this.refreshOrgaOfferings(0, this.ITEMS_PER_PAGE);
  }

  private refreshPublicOfferings(page: number, size: number) {
    this.serviceOfferingApiService.fetchPublicServiceOfferings(page, size, this.applyStatusFilter ? this.selectedStatusFilter : undefined).then(result => {
      console.log(result)
      this.publicOfferingPages = this.updatePageNavigationOptions(result.pageable.pageNumber, result.totalPages);
      this.offerings = result.content;
    });
  }

  private refreshOrgaOfferings(page: number, size: number) {
    this.serviceOfferingApiService.fetchOrganizationServiceOfferings(page, size, this.applyStatusFilter ? this.selectedStatusFilter : undefined).then(result => {
      console.log(result)
      this.orgaOfferingPages = this.updatePageNavigationOptions(result.pageable.pageNumber, result.totalPages);
      this.orgaOfferings = result.content;
    });
  }

  protected filterByStatus(applyFilter: boolean, status: string) {
    // either we should apply the filter and need to refresh, or we switched the filter off and should refresh just once
    if (applyFilter) {
      this.refreshOrgaOfferings(0, this.ITEMS_PER_PAGE);
      this.isFiltered = true;
    } else if (this.isFiltered) {
      this.refreshOrgaOfferings(0, this.ITEMS_PER_PAGE);
      this.isFiltered = false;
    }
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
