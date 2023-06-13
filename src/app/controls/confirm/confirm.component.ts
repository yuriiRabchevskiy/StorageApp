import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss']
})

export class ConfirmComponent {
  @Output() confirm: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Input() yesHeader = "Підтвердити";
  @Input() cancelHeader = "Відмінити";

  constructor() { }

  confirmation(val: boolean) {
    this.confirm.emit(val);
  }
}
