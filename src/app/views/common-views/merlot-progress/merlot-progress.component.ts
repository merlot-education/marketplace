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
