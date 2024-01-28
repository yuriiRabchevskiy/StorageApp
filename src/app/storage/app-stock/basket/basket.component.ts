import { SaleOrder } from './../../../models/storage/order';
import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { ApiService, getDeliveryDescriptor } from '../../../shared/services/api.service';
import { ISaleOrder, IProdOrder, IWarehouse } from '../../../models/storage';
import { ViewState } from '../../../shared/helpers/index';
import { MessageService } from 'primeng/api';
import { OrderEditorComponent } from '../../../controls/index';
import { SecuredComponent } from '../../../models/component';
import { UserService } from '@app/shared/services/user.service';
import { BasketService } from '@app/shared/services/basket.service';
import { IApiErrorResponse } from '@app/models/api';

@Component({
  selector: 'app-basket',
  templateUrl: './basket.component.html',
  styleUrls: ['./basket.component.scss']
})
export class BasketComponent extends SecuredComponent {
  view: ViewState = new ViewState();
  @ViewChild('orderEditor', { static: true }) orderEditor: OrderEditorComponent;
  page: number = 1;
  pageNames: string[] = ['Список товарів', 'Персональні дані'];
  productPage: number = 1;
  clientPage: number = 2;
  lastPage: number = this.pageNames.length;;

  order: ISaleOrder = new SaleOrder();
  isSaving: boolean = false;

  get isNewOrder() {
    return !this.basketService.isEditing;
  }

  get items() {
    return this.basketService.sellList;
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

  constructor(userService: UserService, private apiService: ApiService,
    private basketService: BasketService, notify: MessageService) {
    super(userService, notify);

    if (this.basketService.isEditing) {
      this.pageNames = ['Редагований список товарів'];
      this.lastPage = this.pageNames.length;
    }
  }

  getLocationName(id: number) {
    const location = this.locations.find(i => i.id === id);
    return location.name;
  }

  remove(val: IProdOrder) {
    this.basketService.removeItem(val)
    this.showInfoMessage('Товар видалено з кошика');
    this.removeItem.emit(val);
  }

  private createOrder() {
    const form = this.orderEditor.orderEditForm.value;
    this.order.orderNumber = form.orderNumber;
    this.order.clientName = form.clientName;
    this.order.clientAddress = form.clientAddress;
    this.order.clientPhone = form.clientPhone;
    this.order.other = form.orderOther;
    this.order.status = this.orderEditor.status.value;
    this.order.delivery = this.orderEditor.delivery.value;
    this.order.deliveryString = getDeliveryDescriptor(this.orderEditor.delivery.value);
    this.order.productOrders = this.items.map(it => it.prodOrder);
  }

  getOrderTotal() {
    if (!this.items) return;
    return this.items.map((it) => it.prodOrder.price * it.prodOrder.quantity * it.prodOrder.discountMultiplier).reduce((a, b) => a + b);
  }

  save() {
    if (this.basketService.isEditing) {
      this.finishSaleEdit();
      return;
    }
    // new sale
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
    this.apiService.sale(item).subscribe({
      next: (res) => {
        this.isSaving = false;
        this.onCloseDialog.emit(true);
        this.showSuccessMessage('Продажу здійснено успішно');
      },
      error: (err: IApiErrorResponse) => {
        this.isSaving = false;
        this.showApiErrorMessage('Не вдалося здійснити продажу', err);
      }
    });

  }

  finishSaleEdit() {
    this.isSaving = true;
    const basket = this.basketService;
    const productOrders = basket.sellList.map(it => it.prodOrder);
    this.apiService.editSale(basket.orderId, {
      productOrders: productOrders,
      discountMultiplier: basket.orderDiscountMultiplier
    }).subscribe({
      next: (res) => {
        this.isSaving = false;
        this.onCloseDialog.emit(true);
        this.showSuccessMessage('Продажу успішно відредаговано');
      },
      error: (err: IApiErrorResponse) => {
        this.isSaving = false;
        this.showApiErrorMessage('Не вдалося відредагувати продажу', err);
      }
    });

  }

}
