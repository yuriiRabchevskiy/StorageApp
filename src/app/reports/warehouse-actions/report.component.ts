import { IApiSalePerUser, IApiWarehouseAction } from './../../models/api/reports/sales';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { ApiListComponent } from '../../models/component/list-api.component';
import { ApiResponse } from '../../models/api';
import { Router } from '@angular/router';
import {MessageService} from 'primeng/api';

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
    if (res && res.items.length) {
      res.items.map((it, index) => it.id = `${it.User}-${index}`);
    }
    super.onDataReceived(res);
  }

  onFiltered() {
    super.onFiltered();
  }
}
