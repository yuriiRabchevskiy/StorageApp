import { IApiSalePerUser, IApiOrdersOverview } from './../../models/api/reports/sales';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { ApiListComponent, ITableColumn } from '../../models/component/list-api.component';
import { ApiResponse } from '../../models/api';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { PreferenceService } from '@app/shared/services/preference.service';
import { UserService } from '@app/shared/services/user.service';

@Component({
  selector: 'app-orders-overview',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class OrdersOverviewComponent extends ApiListComponent<IApiOrdersOverview> {
  @Input() from: Date;
  @Input() to: Date;

  _refreshData: boolean = false;
  @Input() set refreshData(val: boolean) {
    this._refreshData = val;
    if (!val) return;
    this.refresh();
    this.change.emit(false);
    this._refreshData = false;
  }
  get refreshData() {
    return this._refreshData;
  }
  @Output() change: EventEmitter<boolean> = new EventEmitter<boolean>();
  selectedItem: IApiOrdersOverview;
  totals: IApiOrdersOverview = <any>{};

  public columns: ITableColumn[] = [
    { title: 'Користувач', field: 'category', width: 114, template: 'date', format: 'dd/MM/yy HH:mm', },
    { title: 'Замовлень', field: 'ordersCount', width: 126, template: 'pageSpecial1' },
    { title: 'Ціна продажі', field: 'sales', width: 180 },
    { title: 'Закритих', field: 'closedCount', width: 180 },
    { title: 'Ціна закритих', field: 'closedPrice', width: 80 },
    { title: 'Знижка закритих', field: 'closeDiscount', width: 80 },
    { title: 'Відкритих', field: 'openCount', width: 126, template: 'pageSpecial1' },
    { title: 'Ціна відкритих', field: 'openPrice', width: 180 },
    { title: 'Знижка відкритих', field: 'openDiscount', width: 180 },
    { title: 'Скасованих', field: 'canceledCount', width: 80 },
  ];

  constructor(userService: UserService, private apiService: ApiService,
    public router: Router, notify: MessageService, preferences: PreferenceService) {
    super(userService, notify, preferences);
    this.initHiddenColumns('reportOrdersOverviewColumns');
  }

  doGetData() {
    return this.apiService.getOrdersOverview(this.from, this.to);
  }

  onDataReceived(res: ApiResponse<IApiOrdersOverview>) {
    if (res && res.items.length) {
      res.items.map((it, index) => it.id = `${it.category}-${index}`);
    }
    super.onDataReceived(res);
  }

  onFiltered() {
    super.onFiltered();
    const filtered = this.filteredData;
    const newTotals: IApiOrdersOverview = <any>{
      sales: 0, quantity: 0, ordersCount: 0, buyPrice: 0, profit: 0, category: 0,
      openCount: 0, closedCount: 0, canceledCount: 0, openPrice: 0, closedPrice: 0, canceledPrice: 0,
      openDiscount: 0, closeDiscount: 0,
    };
    filtered.reduce((sum, it) => {
      newTotals.category += 1;
      newTotals.sales += it.sales;
      newTotals.quantity += it.quantity;
      newTotals.profit += it.profit;
      newTotals.buyPrice += it.buyPrice;
      newTotals.ordersCount += it.ordersCount;
      newTotals.openCount += it.openCount;
      newTotals.closedCount += it.closedCount;
      newTotals.canceledCount += it.canceledCount;
      newTotals.openPrice += it.openPrice;
      newTotals.closedPrice += it.closedPrice;
      newTotals.canceledPrice += it.canceledPrice;
      newTotals.openDiscount += it.openDiscount;
      newTotals.closeDiscount += it.closeDiscount;
      return newTotals;
    }, newTotals);
    this.totals = newTotals;
  }
}
