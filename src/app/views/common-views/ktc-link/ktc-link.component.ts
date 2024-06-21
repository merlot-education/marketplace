import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-ktc-link',
  templateUrl: './ktc-link.component.html',
  styleUrls: ['./ktc-link.component.scss']
})
export class KtcLinkComponent {
  @Input() link: string;
  @Input() title: string;

  protected openLink() {
    window.open(this.link ,this.title, 'width=1280,height=720');
  }

}
