import { IOrder } from './../../models/storage/order';
import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { ICancelOrder, CancelOrder } from '../../models/storage';

export interface IReturnOrder {
  item: ICancelOrder;
  conf: boolean;
}

@Component({
  selector: 'app-return',
  templateUrl: './return.component.html',
  styleUrls: ['./return.component.scss']
})

export class ReturnComponent implements OnInit {
  cancelOrder: FormGroup;
  reason: FormControl;

  @Output() confirm: EventEmitter<IReturnOrder> = new EventEmitter<IReturnOrder>();
  @Input() order: IOrder;

  constructor() { }

  ngOnInit() {
    this.createOrderControl();
    this.createOrderForm();
  }

  createOrderControl() {
    this.reason = new FormControl('', Validators.required);
  }

  createOrderForm() {
    this.cancelOrder = new FormGroup({
      reason: this.reason
    });
  }

  confirmation(val: boolean) {
    let item = new CancelOrder(this.reason.value);
    this.confirm.emit({ item: item, conf: val });
  }
}
