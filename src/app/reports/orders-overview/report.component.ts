import { IApiSalePerUser, IApiOrdersOverview } from './../../models/api/reports/sales';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { ApiListComponent } from '../../models/component/list-api.component';
import { ApiResponse } from '../../models/api';
import { Router } from '@angular/router';
import {MessageService} from 'primeng/api';

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

  constructor(private apiService: ApiService, public router: Router, notifi: MessageService) {
    super(notifi);
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
      sales: 0, quantity: 0, ordersCount: 0, buyPrice: 0, profit: 0,
      openCount: 0, closedCount: 0, canceledCount: 0, openPrice: 0, closedPrice: 0, canceledPrice: 0
    };
    filtered.reduce((sum, it) => {
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
      return newTotals;
    }, newTotals);
    this.totals = newTotals;
  }
}
