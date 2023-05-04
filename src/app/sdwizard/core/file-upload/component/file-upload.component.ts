import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {ShaclFile} from '@models/shacl-file';
import {Shape} from '@models/shape';
import {ApiService} from '@services/api.service';
import {FormfieldControlService} from '@services/form-field.service';
import {FileValidator} from '../file-validator';
import { EventEmitter } from '@angular/core';
import { Input,Output } from '@angular/core';


@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnInit {
  @Output()
  notify:EventEmitter <boolean> = new EventEmitter();

  @Input() closeModal: (id: string) => void;
  file: File | null = null;
  allowedExtensions = ['ttl'];
  form: FormGroup;
  requestError: boolean;
  shaclFile: ShaclFile;
  filteredShapes: Shape[];
  private subscription: Subscription | undefined;
  
  constructor(
    private apiService: ApiService,
    private formBuilder: FormBuilder,
    private router: Router,
    private formfieldService: FormfieldControlService 
  ) {

    this.form = this.formBuilder.group({
      file: new FormControl('', [Validators.required, FileValidator.fileExtensions(this.allowedExtensions)]),
      fileSource: new FormControl('', [Validators.required, FileValidator.fileExtensions(this.allowedExtensions)])
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  ngOnInit(): void {
  }

  onFileChange(event): void {

    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.form.patchValue({
        fileSource: file
      });
    }
  }

  onSubmit(): void {
    this.subscription = this.apiService.upload(this.form.get('fileSource').value).subscribe(
      res => {
        console.log(res);
        this.shaclFile = this.formfieldService.readShaclFile(res);
        console.log(this.shaclFile);
        this.filteredShapes = this.formfieldService.updateFilteredShapes(this.shaclFile);
        if (this.filteredShapes.length > 1) {
          this.router.navigate(['/select-shape'], {state: {file: this.shaclFile}});
        } else {
          this.updateSelectedShape();
          this.router.navigate(['/form'], {state: {file: this.shaclFile}});
        }
      },
      err => this.requestError = true
    );
    //this.modal.close('upload-modal');    
    //console.log("Call closing statement here");
   this.notify.emit(true);
  }

  updateSelectedShape(): void {
    const shape = this.filteredShapes[0];
    if (shape !== undefined) {
      this.shaclFile.shapes.find(x => x.name === shape.name).selected = true;
    }
  }
}


