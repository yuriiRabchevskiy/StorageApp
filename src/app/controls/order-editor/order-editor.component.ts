import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IOrder, OrderStatus } from './../../models/storage';
import { deliveryTypes } from './../../models/storage/order';


@Component({
  selector: 'app-order-editor',
  templateUrl: './order-editor.component.html',
  styleUrls: ['./order-editor.component.scss']
})
export class OrderEditorComponent implements OnInit {
  public orderEditForm: FormGroup;
  public orderNumber: FormControl;
  public clientName: FormControl;
  public clientAddress: FormControl;
  public clientPhone: FormControl;
  public status: FormControl;
  public delivery: FormControl;
  public orderOther: FormControl;

  public get invalid() { return this.orderEditForm.invalid; }

  public editedOrderId: number;
  @Input() item: IOrder = { id: 0 };
  @Input() canEdit: boolean;


  deliveryTypes = deliveryTypes;

  statuses = [
    { label: 'Прийнятий', value: OrderStatus.Open },
    { label: 'Комплектується', value: OrderStatus.Processing },
    { label: 'Відправлений', value: OrderStatus.Shipping },
    { label: 'Отриманий', value: OrderStatus.Delivered },
  ];

  constructor() { }

  ngOnInit() {
    this.createOrderControl(this.item);
    this.createOrderForm();
  }

  createOrderControl(val: IOrder) {
    this.editedOrderId = val.id;
    this.orderNumber = new FormControl(this.item.orderNumber,
      [Validators.required, Validators.pattern('^[0-9]+$')
      ]);
    this.clientName = new FormControl(this.item.clientName, Validators.required);
    this.clientAddress = new FormControl(this.item.clientAddress, Validators.required);
    this.clientPhone = new FormControl(this.item.clientPhone,
      [Validators.required, Validators.minLength(9), Validators.pattern('^[0-9]+$')]
    );
    this.status = new FormControl({
      value: this.item.status ?? this.statuses[0].value,
      disabled: !this.item.id
    });
    this.delivery = new FormControl({
      value: this.item.delivery ?? this.deliveryTypes[0].value,
      disabled: false
    });
    this.orderOther = new FormControl(this.item.other);
  }

  createOrderForm() {
    this.orderEditForm = new FormGroup({
      orderNumber: this.orderNumber,
      clientName: this.clientName,
      clientAddress: this.clientAddress,
      clientPhone: this.clientPhone,
      status: this.status,
      delivery: this.delivery,
      orderOther: this.orderOther
    });
  }

  onPhoneChange(event: FocusEvent) {
    const target = event.target as HTMLInputElement;
    let value = target.value;
    // trim spaces
    value = value.trim();
    // cut +38 from start
    if (value.startsWith("+38")) {
      value = value.substring(3);
      value = value.trim();
    }
    // replace all non numbers with empty
    value = value.replace(/[^0-9]*/g, '')
    if (value === target.value) return;
    this.clientPhone.setValue(value);
  }

  getNumberError() {
    return this.orderNumber.hasError('required') ? 'Номер накладної не введено' :
      this.orderNumber.hasError('pattern') ? 'Тільки числовий номер' : '';
  }

  getTelError() {
    return this.clientPhone.hasError('required') ? 'Ви не ввели телефон' :
      this.clientPhone.hasError('minlength') ? 'Не менше 9 символів' :
        this.clientPhone.hasError('pattern') ? 'Тільки числа' : '';
  }

}
