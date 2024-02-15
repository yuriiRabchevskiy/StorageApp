import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BasketService } from '@app/shared/services/basket.service';
import { PreferenceService } from '@app/shared/services/preference.service';
import { UserService } from '@app/shared/services/user.service';
import { groupBy } from 'lodash';
import * as moment from 'moment-mini';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { ApiResponse } from '../../../models/api';
import { ApiListComponent, ITableColumn } from '../../../models/component/list-api.component';
import { Dictionary } from '../../../models/dictionary';
import { StringFilter } from '../../../models/filtering/filters';
import { IClientOrder, IClientTransaction, IOrder, OrderStatus, buildProductFullName } from '../../../models/storage';
import { ApiService } from '../../../shared/services/api.service';
import { EntityStateHandler } from '../../../shared/services/tracker.service';

@Component({
  selector: 'app-client-orders',
  templateUrl: './client-orders.component.html',
  styleUrls: ['./client-orders.component.scss']
})
export class ClientOrdersComponent extends ApiListComponent<IClientOrder>{
  @ViewChild('dt', { static: true }) public dataTable: Table;

  buildProductFullName = buildProductFullName;
  private _ordersState = new EntityStateHandler(
    (_: EntityStateHandler, diff: number) => {
      this.showInfoMessage(
        `Стан замовлень на сервері і в браузері може відрізнятися.
          Пропущено ${diff - 1} змін.
          Рекомендується оновити список замовлень`)
    }
  );

  public selectedItem: IOrder;
  public stringFilters: StringFilter<IClientOrder> = new StringFilter<IClientOrder>();

  public get visibleOrders(): IOrder[] {
    return (this.dataTable.filteredValue ?? this.dataTable.value ?? []);
  }

  public columns: ITableColumn[] = [
    { title: 'Дата продажу', field: 'openDate', width: 114, template: 'date', format: 'dd/MM/yy HH:mm', },
    { title: 'Накладна', field: 'orderNumber', width: 126, template: 'pageSpecial1' },
    { title: 'Статус', field: 'statusStr', width: 180 },
    { title: 'Товари', field: 'itemsName', width: 180 },
    { title: 'Сума', field: 'totalPrice', width: 80 },
    {
      title: 'Дата закриття', field: 'closeDate', width: 114, template: 'date', format: 'dd/MM/yy',
    },
    // {
    //   title: 'Дата відміни', field: 'cancelDate', width: 114, template: 'date', format: 'dd/MM/yy',
    // },
    { title: 'Нотатки', field: 'other', template: 'pageSpecial3' },

  ];

  get viewData() {
    return this.filteredData;
  }

  csvFileName: string;
  headers = {
    id: '№',
    orderNumber: 'Номер накладної',
    date: 'Дата продажу',
    seller: 'Продавець',
    products: 'Товари'
  };

  itemsFormatted = [];

  constructor(userService: UserService, private apiService: ApiService,
    public router: Router, public basketService: BasketService,
    notify: MessageService, preferences: PreferenceService) {
    super(userService, notify, preferences);
    this.initHiddenColumns('ordersColumns');
  }

  onItemClick(event: IOrder) {
    this.onRowClick(event);
  }

  doGetData() {
    return this.apiService.getMyClientOrders();
  }

  onDataReceived(res: ApiResponse<IClientOrder>) {

    this._ordersState.set(res.revision);
    res.items.map(it => {
      it.openDate = new Date(it.openDate);
      it.date = moment(it.openDate).format('DD/MM/YYYY');
      it.itemsName = this.getItemsName(it.products);
      it.statusStr = this.getStatusStr(it);
    });
    res.items.sort(this.orderByDate);

    super.onDataReceived(res);
  }

  getStatusStr(order: IClientOrder) {
    switch (order.status) {
      case OrderStatus.Open: return 'Прийняте';
      case OrderStatus.Processing: return 'Комплектується';
      case OrderStatus.Shipping: return 'Відправлене';
      case OrderStatus.Delivered: return 'Отримане';
      case OrderStatus.Canceled: return 'Скасоване';
      default: return '???';
    }
  }

  getItemsName(val: IClientTransaction[]) {
    const allTypes = val.map(it => it.product.productType);
    const group = groupBy(allTypes);
    const keys = Object.keys(group);
    const unique = keys.filter(it => group[it].length < 2);
    const duplicates = keys.filter(it => group[it].length >= 2).map(it => `${it} x${group[it].length}`);
    return unique.concat(duplicates).sort().join(',');
  }

  orderByDate(a, b) {
    const dateA = new Date(a.date).getFullYear();
    const dateB = new Date(b.date).getFullYear();
    return dateA - dateB;
  }

  restoreBasket() {
    this.basketService.restore(this.selectedItem);
    this.showInfoMessage("Замовлення відновлено і може бути редаговане на сторінці Складу");
  }

  expandOrders() {
    const dictionary = new Dictionary<boolean>();
    this.filteredData.map(it => dictionary[it.id.toString()] = true);
    this.dataTable.expandedRowKeys = dictionary;
  }

  collapseOrders() {
    this.dataTable.expandedRowKeys = {};
  }

  generateProductList(val) {
    let str = '';
    for (let i = 0; i < val.products.length; i++) {
      const color = val.products[i].product.color;
      const model = val.products[i].product.model;
      const type = val.products[i].product.productType;
      if (str !== '') {
        str += ';\u00A0';
      }
      str += (color || '') + ' ' + (model || '') + ' ' + (type || '');
    }
    return str;
  }

  getDateKey(d: Date) {
    return `${d.getDate()}`;
  }


}
