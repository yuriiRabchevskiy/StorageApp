import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { PreferenceService } from '@app/shared/services/preference.service';
import { MessageService } from 'primeng/api';
import { ApiResponse } from '../../models/api';
import { ApiListComponent } from '../../models/component/list-api.component';
import { ApiService } from '../../shared/services/api.service';
import { IApiSalePerUser } from './../../models/api/reports/sales';

@Component({
  selector: 'app-sales-per-user',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class SalesPerUsersComponent extends ApiListComponent<IApiSalePerUser> {
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
  
  selectedItem: IApiSalePerUser;
  totals: IApiSalePerUser = <any>{};

  constructor(private apiService: ApiService, public router: Router, notify: MessageService, preferences: PreferenceService) {
    super(notify, preferences);
  }

  doGetData() {
    return this.apiService.getSalesPerUser(this.from, this.to);
  }

  onDataReceived(res: ApiResponse<IApiSalePerUser>) {
    if (res && res.items.length) {
      res.items.map((it, index) => it.id = `${it.category}-${index}`);
    }
    super.onDataReceived(res);
  }

  onFiltered() {
    super.onFiltered();
    const filtered = this.filteredData;
    const newTotals: IApiSalePerUser = <any>{ sales: 0, quantity: 0, ordersCount: 0, buyPrice: 0, profit: 0 };
    filtered.reduce((sum, it) => {
      newTotals.sales += it.sales;
      newTotals.quantity += it.quantity;
      newTotals.profit += it.profit;
      newTotals.buyPrice += it.buyPrice;
      newTotals.ordersCount += it.ordersCount;
      return newTotals;
    }, newTotals);
    this.totals = newTotals;
  }
}
