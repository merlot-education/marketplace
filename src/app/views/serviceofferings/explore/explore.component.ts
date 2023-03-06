import { Component, OnInit } from '@angular/core';
import {IOfferings, offerings} from '../serviceofferings-data'



@Component({
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss']
})
export class ExploreComponent implements OnInit {

  offerings: IOfferings[] = offerings;
  constructor() {
  }

  ngOnInit(): void {
  }
}
