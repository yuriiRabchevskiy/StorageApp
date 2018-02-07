import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-i-button',
  templateUrl: './icon-button.component.html',
  styleUrls: ['./icon-button.component.scss']
})

export class IconButtonComponent {
  @Input() title: string = '';
  @Input() buttClass: string;
  @Input() disabled: boolean = false;
  @Input() icon: string;
  @Input() sprite: string = 'app-sprite';
  @Output() iClick: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  onClick($event) {
    if (this.disabled) return;
    this.iClick.emit($event);
  }

}
