import { SaleOrder } from './../../../models/storage/order';
import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { ApiService } from '../../../shared/services/api.service';
import { IProduct, IOrder, Order, ISell, Sell, ISaleOrder, IProdOrder, IWarehouse } from '../../../models/storage';
import { ViewState } from '../../../shared/helpers/index';
import { MessageService } from 'primeng/components/common/messageservice';
import { OrderEditorComponent } from '../../../controls/index';

@Component({
  selector: 'app-basket',
  templateUrl: './basket.component.html',
  styleUrls: ['./basket.component.scss']
})

export class BasketComponent {
  view: ViewState = new ViewState();
  @ViewChild('orderEditor') orderEditor: OrderEditorComponent;
  page: number = 1;
  pages: string[] = ['Список товарів', 'Персональні дані'];
  pageNames: string[] = this.pages;
  productPage: number = 1;
  clientPage: number = 2;
  lastPage: number = 2;
  order: ISaleOrder = new SaleOrder();

  _items: IProdOrder[];
  get items() {
    return this._items;
  }
  @Input() set items(val) {
    this._items = val;
  }

  _locations: IWarehouse[] = [];
  @Input() set locations(val: IWarehouse[]) {
    if (!val) return;
    this._locations = val;
  }
  get locations() {
    return this._locations;
  }

  @Output() onCloseDialog: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() sale: EventEmitter<ISaleOrder> = new EventEmitter<ISaleOrder>();
  @Output() removeItem: EventEmitter<any> = new EventEmitter<any>();
  constructor(private apiService: ApiService,
    private notifi: MessageService) {
  }

  getLocationName(id: number) {
    let location =  this.locations.find(i => i.id === id);
    return location.name;
  }

  remove(val) {
    this.items.splice(this.items.indexOf(val), 1);
    this.notifi.add(
      {
        severity: 'info',
        summary: 'Info',
        detail: 'Товар видалено з кошика'
      });
    this.removeItem.emit(val);
  }

  createOrder() {
    this.order.orderNumber = this.orderEditor.orderEditForm.value.orderNumber;
    this.order.clientName = this.orderEditor.orderEditForm.value.clientName;
    this.order.clientAddress = this.orderEditor.orderEditForm.value.clientAddress;
    this.order.clientPhone = this.orderEditor.orderEditForm.value.clientPhone;
    this.order.status = this.orderEditor.status.value;
    this.order.other = this.orderEditor.orderEditForm.value.orderOther;
    this.order.payment = this.orderEditor.payment.value;
    this.order.productOrders = this.items.map( it => it.prodOrder );
  }

  save() {
    this.createOrder();
    this.sale.emit(this.order);
  }

  closeDialog() {
    this.onCloseDialog.emit(false);
  }

  back() {
    if (this.page > 1) {
      this.page--;
    }
  }

  next() {
    if (this.page < this.pageNames.length) {
      this.page++;
    }
  }

}
