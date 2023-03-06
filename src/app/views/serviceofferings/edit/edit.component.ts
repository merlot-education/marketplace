import { Component, OnInit } from '@angular/core';
import { IOfferings, offerings } from '../serviceofferings-data';

@Component({
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit {
  offerings: IOfferings[] = offerings;

  constructor() {
  }

  ngOnInit(): void {
  }
}
