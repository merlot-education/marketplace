import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { ShaclFile } from '@models/shacl-file';
import { Shape } from '@models/shape';
import { FormfieldControlService } from '@services/form-field.service';
import { serviceFileNameDict } from '../serviceofferings-data';
import { ServiceofferingApiService } from 'src/app/services/serviceoffering-api.service';

@Component({
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit {

  serviceFileNameDict = serviceFileNameDict;

  serviceFiles: string[];
  ecoSystem: string= "merlot";// pass this to getFiles Api
  shaclFile: ShaclFile;
  filteredShapes: Shape[];
  file: ShaclFile = new ShaclFile();

  private ignoredServiceFiles: string[] = ["Merlot ServiceOffering.json"];

  constructor(private serviceofferingsApiService: ServiceofferingApiService, protected authService : AuthService, private formFieldService: FormfieldControlService) {
  }


  ngOnInit(): void {
    this.requestShapes(this.ecoSystem);
  }
  

  requestShapes(system:string){
    //pass the system string down here
    this.serviceofferingsApiService.fetchAvailableShapes(system).then(res => {
      for (let i = 0; i < res?.Service.length;) {
        if (this.ignoredServiceFiles.includes(res?.Service[i])) {
          res?.Service.splice(i, 1);
        } else {
          i += 1;
        }
      }
      this.serviceFiles=res?.Service;
      this.serviceFiles.sort((a, b) => (serviceFileNameDict[a].name < serviceFileNameDict[b].name ? -1 : 1));
      this.select(this.serviceFiles[0]);
    });
  }

  select(name: string): void {
    this.serviceofferingsApiService.fetchShape(name).then(
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
