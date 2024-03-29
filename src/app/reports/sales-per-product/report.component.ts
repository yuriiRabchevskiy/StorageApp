import { UserService } from './../../shared/services/user.service';
import { IApiSale } from './../../models/api/reports/sales';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { ApiListComponent } from '../../models/component/list-api.component';
import { ApiResponse } from '../../models/api';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { PreferenceService } from '@app/shared/services/preference.service';

@Component({
  selector: 'app-sales-per-product',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class SalesPerProductComponent extends ApiListComponent<IApiSale> {
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
  selectedItem: IApiSale;
  totals: IApiSale = <any>{};

  constructor(userService: UserService, private apiService: ApiService,
    public router: Router, notify: MessageService, preferences: PreferenceService) {
    super(userService, notify, preferences);
  }

  doGetData() {
    return this.apiService.getSalesPerProduct(this.from, this.to);
  }

  onDataReceived(res: ApiResponse<IApiSale>) {
    if (res && res.items.length) {
      res.items.map((it, index) => it.id = `${index}-${it.buyPrice}-${it.sales}-${it.profit}`);
    }
    super.onDataReceived(res);
  }

  onFiltered() {
    super.onFiltered();
    const filtered = this.filteredData;
    const newTotals: IApiSale = <any>{ sales: 0, quantity: 0, ordersCount: 0, buyPrice: 0, profit: 0 };
    filtered.reduce((sum, it) => {
      newTotals.sales += it.sales;
      newTotals.quantity += it.quantity;
      newTotals.profit += it.profit;
      newTotals.buyPrice += it.buyPrice;
      return newTotals;
    }, newTotals);
    this.totals = newTotals;
  }
}
