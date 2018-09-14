import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-button-group',
  templateUrl: './button-group.component.html',
  styleUrls: ['./button-group.component.scss']
})
export class ButtonGroupComponent {
  isShow: boolean = false;
  @Input() minimized: boolean = false;
  @Input() groupWrapClass: string = '';
  @Input() openBottom: boolean = false;
  @Input() iconClass: string = '';
  constructor() { }

}
