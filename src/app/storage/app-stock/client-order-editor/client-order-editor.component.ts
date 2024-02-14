import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-client-order-editor',
  templateUrl: './client-order-editor.component.html',
  styleUrls: ['./client-order-editor.component.scss']
})
export class ClientOrderEditorComponent implements OnInit {
  public orderEditForm: FormGroup;
  public orderNumber: FormControl;
  public orderOther: FormControl;

  public get invalid() { return this.orderEditForm.invalid; }

  @Input() canEdit: boolean;

  constructor() { }

  ngOnInit() {
    this.createOrderForm();
  }

  createOrderForm() {
    this.orderNumber = new FormControl('',
      [Validators.required, Validators.pattern('^[0-9]+$')
      ]);
    this.orderOther = new FormControl('');
    this.orderEditForm = new FormGroup({
      orderNumber: this.orderNumber,
      orderOther: this.orderOther
    });
  }

  getNumberError() {
    return this.orderNumber.hasError('required') ? 'Номер накладної не введено' :
      this.orderNumber.hasError('pattern') ? 'Тільки числовий номер' : '';
  }

}
