import { SaleOrder } from './../../../models/storage/order';
import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { ApiService, getDeliveryDescriptor } from '../../../shared/services/api.service';
import { ISaleOrder, IProdOrder, IWarehouse } from '../../../models/storage';
import { ViewState } from '../../../shared/helpers/index';
import { MessageService } from 'primeng/api';
import { OrderEditorComponent } from '../../../controls/index';
import { SecuredComponent } from '../../../models/component';
import { UserService } from '@app/shared/services/user.service';

@Component({
  selector: 'app-basket',
  templateUrl: './basket.component.html',
  styleUrls: ['./basket.component.scss']
})

export class BasketComponent extends SecuredComponent {
  view: ViewState = new ViewState();
  @ViewChild('orderEditor', { static: true }) orderEditor: OrderEditorComponent;
  page: number = 1;
  pages: string[] = ['Список товарів', 'Персональні дані'];
  pageNames: string[] = this.pages;
  productPage: number = 1;
  clientPage: number = 2;
  lastPage: number = 2;
  order: ISaleOrder = new SaleOrder();
  isSaving: boolean = false;

  _items: IProdOrder[];
  get items() {
    return this._items;
  }
  @Input() set items(val) {
    this._items = val;
  }

  @Input() canEdit: boolean;

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
  constructor(userService: UserService, private apiService: ApiService, notify: MessageService) {
    super(userService, notify);
  }

  getLocationName(id: number) {
    const location = this.locations.find(i => i.id === id);
    return location.name;
  }

  remove(val) {
    this.items.splice(this.items.indexOf(val), 1);
    this.showInfoMessage('Товар видалено з кошика');
    this.removeItem.emit(val);
  }

  createOrder() {
    this.order.orderNumber = this.orderEditor.orderEditForm.value.orderNumber;
    this.order.clientName = this.orderEditor.orderEditForm.value.clientName;
    this.order.clientAddress = this.orderEditor.orderEditForm.value.clientAddress;
    this.order.clientPhone = this.orderEditor.orderEditForm.value.clientPhone;
    this.order.status = this.orderEditor.status.value;
    this.order.other = this.orderEditor.orderEditForm.value.orderOther;
    this.order.delivery = this.orderEditor.delivery.value;
    this.order.deliveryString = getDeliveryDescriptor(this.orderEditor.delivery.value);
    this.order.productOrders = this.items.map(it => it.prodOrder);
  }

  getOrderTotal() {
    if (!this.items) return;
    return this.items.map((it) => it.prodOrder.price * it.prodOrder.quantity).reduce((a, b) => a + b);
  }

  save() {
    this.createOrder();
    this.finishSale(this.order);
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

  finishSale(item: ISaleOrder) {
    this.isSaving = true;
    this.apiService.sale(item).subscribe(
      res => {
        this.isSaving = false;
        if (res.success) {
          this.onCloseDialog.emit(true);
          return this.showSuccessMessage('Продажу здійснено успішно');
        }
        this.showApiErrorMessage('Помилка при здійснені продажі!', res.errors);
      },
      err => {
        this.isSaving = false;
        this.showWebErrorMessage('Не вдалося здійснити продажу', err);
      }
    );
  }

}
