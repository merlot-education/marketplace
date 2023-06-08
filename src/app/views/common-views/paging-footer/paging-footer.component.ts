import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IPageOfferings } from 'src/app/views/serviceofferings/serviceofferings-data';
import { ISpringPage } from './page-data';

interface IPageOption {
  target: number;
  text: string;
  disabled: boolean;
  active: boolean;
}

@Component({
  selector: 'app-paging-footer',
  templateUrl: './paging-footer.component.html',
  styleUrls: ['./paging-footer.component.scss']
})
export class PagingFooterComponent implements OnInit {

  @Input() private currentPage: BehaviorSubject<ISpringPage>;
  @Output() private pageChangeEvent = new EventEmitter<number>();

  protected pageOptions: IPageOption[];

  constructor() {
  }
  ngOnInit(): void {
    this.currentPage.subscribe(newPage => {
      this.pageOptions = this.updatePageNavigationOptions(newPage.pageable.pageNumber, newPage.totalPages)
    });
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

  protected handleNavigation(option: IPageOption) {
    if (option.active) {
      return;
    }

    this.pageChangeEvent.emit(option.target);
  }
  

}
