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

import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-merlot-progress',
  templateUrl: './merlot-progress.component.html',
  styleUrls: ['./merlot-progress.component.scss']
})
export class MerlotProgressComponent implements OnInit {
  protected progressPercent = 0;
  protected barTextPercentPrefix = "";
  protected barText = "0%";
  protected barColor = "primary";
  protected darkText = false;

  ngOnInit() {
  }

  public setProgress(percent: number) {
    this.barColor = "primary"
    this.darkText = false;
    if (percent >= 0 && percent <= 100) {
      this.progressPercent = percent;
      this.barText = this.barTextPercentPrefix + percent + "%";
    }
  }

  public setFail(message?: string) {
    this.barColor = "danger";
    this.darkText = false;
    if (message) {
      this.barText = message;
    }
  }

  public setSuccess(message?: string) {
    this.barColor = "success";
    this.darkText = true;
    if (message) {
      this.barText = message;
    }
  }

  public setBarTextPercentPrefix(prefix: string) {
    this.barTextPercentPrefix = prefix;
  }

}
