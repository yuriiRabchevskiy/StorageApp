import { MakeSelfOrderCommand } from '../../../models/storage/order';
import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { ApiService } from '../../../shared/services/api.service';
import { ISaleOrder, IProdOrder, IWarehouse } from '../../../models/storage';
import { ViewState } from '../../../shared/helpers/index';
import { MessageService } from 'primeng/api';
import { SecuredComponent } from '../../../models/component';
import { UserService } from '@app/shared/services/user.service';
import { BasketService } from '@app/shared/services/basket.service';
import { IApiErrorResponse } from '@app/models/api';
import { ClientOrderEditorComponent } from '../client-order-editor/client-order-editor.component';

@Component({
  selector: 'app-client-basket',
  templateUrl: './client-basket.component.html',
  styleUrls: ['./client-basket.component.scss']
})
export class ClientBasketComponent extends SecuredComponent {

  @ViewChild('orderEditor', { static: true }) orderEditor: ClientOrderEditorComponent;
  view: ViewState = new ViewState();

  page: number = 1;
  pageNames: string[] = ['Список товарів', 'Додаткові дані'];
  productPage: number = 1;
  clientPage: number = 2;
  lastPage: number = this.pageNames.length;;
  isSaving: boolean = false;

  get items() {
    return this.basketService.sellList;
  }

  @Input() canEdit: boolean;
  @Input() discountMultiplier: number = 1.0;
  @Input() discountPercent = 0;

  _locations: IWarehouse[] = [];
  get locations() { return this._locations; }
  @Input() set locations(val: IWarehouse[]) {
    if (!val) return;
    this._locations = val;
  }

  @Output() onCloseDialog: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() sale: EventEmitter<ISaleOrder> = new EventEmitter<ISaleOrder>();
  @Output() removeItem: EventEmitter<any> = new EventEmitter<any>();

  constructor(userService: UserService, private apiService: ApiService,
    private basketService: BasketService, notify: MessageService) {
    super(userService, notify);
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


  getOrderTotal() {
    if (!this.items) return;
    return this.items.map((it) => it.prodOrder.price * it.prodOrder.quantity * it.prodOrder.discountMultiplier)
      .reduce((a, b) => a + b);
  }

  save() {
    const order: MakeSelfOrderCommand = new MakeSelfOrderCommand();
    const form = this.orderEditor.orderEditForm.value;
    order.orderNumber = form.orderNumber;
    order.other = form.orderOther;
    order.discountMultiplier = this.discountMultiplier;
    order.productOrders = this.items.map(it => it.prodOrder);
    this.finishSale(order);
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

  finishSale(item: MakeSelfOrderCommand) {
    this.isSaving = true;
    this.apiService.selfClientSale(item).subscribe({
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


}
