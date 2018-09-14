import { IApiSalePerUser, IApiWarehouseAction } from './../../models/api/reports/sales';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { ApiListComponent } from '../../models/component/list-api.component';
import { ApiResponse } from '../../models/api';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/components/common/messageservice';

@Component({
  selector: 'app-warehouse-actions',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class WarehouseActionsComponent extends ApiListComponent<IApiWarehouseAction> {
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

  selectedItem: IApiWarehouseAction;
  totals: IApiWarehouseAction = <any>{};

  constructor(private apiService: ApiService, public router: Router, notifi: MessageService) {
    super(notifi);
  }

  doGetData() {
    return this.apiService.getWarehouseActions(this.from, this.to);
  }

  onDataReceived(res: ApiResponse<IApiWarehouseAction>) {
    super.onDataReceived(res);
  }

  onFiltered() {
    super.onFiltered();
    const filtered = this.filteredData;
    // const newTotals: IApiSalePerUser = <any>{ sales: 0, quantity: 0, ordersCount: 0, buyPrice: 0, profit: 0 };
    // filtered.reduce((sum, it) => {
    //   newTotals.sales += it.sales;
    //   newTotals.quantity += it.quantity;
    //   newTotals.profit += it.profit;
    //   newTotals.buyPrice += it.buyPrice;
    //   newTotals.ordersCount += it.ordersCount;
    //   return newTotals;
    // }, newTotals);
    // this.totals = newTotals;
  }



}
