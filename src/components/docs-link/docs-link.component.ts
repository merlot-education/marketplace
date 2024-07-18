/*
 *  Copyright 2024 Dataport. All rights reserved. Developed as part of the MERLOT project.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { Component, HostBinding, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-docs-link',
  templateUrl: './docs-link.component.html',
  styleUrls: ['./docs-link.component.scss']
})
export class DocsLinkComponent implements OnInit {

  @Input() href?: string = 'https://coreui.io/angular/docs/';
  @Input() name?: string;
  @Input() text?: string;

  constructor() { }

  @HostBinding('class')
  get hostClasses(): any {
    return {
      'float-end': true
    };
  }

  ngOnInit(): void {
    this.href = this.name ? `https://coreui.io/angular/docs/components/${this.name}` : this.href;
  }

}
