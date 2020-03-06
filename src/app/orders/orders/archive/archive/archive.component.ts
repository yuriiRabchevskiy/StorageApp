import { Component, ViewChild } from '@angular/core';
import { ApiListComponent } from 'app/models/component';
import { Dictionary, IDictionary } from 'app/models/dictionary';
import { StringFilter } from 'app/models/filtering/filters';
import { IOrder, IOrderAction, ITransaction } from 'app/models/storage';
import { ApiService } from 'app/shared/services/api.service';
import * as moment from 'moment-mini';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { ApiResponse } from '@app/models/api/api/api';

interface IDoubleClick {
  date?: number;
  element?: IOrder;
}

@Component({
  selector: 'app-archive',
  templateUrl: './archive.component.html',
  styleUrls: ['./archive.component.scss']
})
export class ArchiveComponent extends ApiListComponent<IOrder> {

  @ViewChild('dt', { static: true }) public dataTable: Table;
  public selectedItem: IOrder;
  public orderDialog: boolean = false;
  public showConfirm: boolean = false;
  public archiveFrom: Date;
  public archiveTo: Date;
  public showOrderHistory: boolean = false;
  public stringFilters: StringFilter<IOrder> = new StringFilter<IOrder>();
  public rowGroupMetadata: IDictionary<any>;

  public orderHistory: IOrderAction[] = [];

  public clickInfo: IDoubleClick = {};

  get rowMetadata() {
    return this.rowGroupMetadata;
  }

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

  constructor(private apiService: ApiService, notify: MessageService) {
    super(notify);

    const date = new Date(Date.now());
    this.archiveFrom = new Date(date.getFullYear(), date.getMonth() - 3, 1);
    this.archiveTo = new Date(date.getFullYear(), date.getMonth() - 2, 1);
  }

  doGetData() {
    return this.apiService.getOrdersArchive(this.archiveFrom, this.archiveTo);
  }

  onDataReceived(res: ApiResponse<IOrder>) {
    if (res.success) {
      res.items.map(it => {
        it.openDate = new Date(it.openDate);
        it.date = moment(it.openDate).format('DD/MM/YYYY');
        it.itemsName = this.getItemsName(it.products);
      });
      res.items.sort(this.orderByDate);
    }
    super.onDataReceived(res);
    this.updateMetadata();
  }

  public nextPeriod() {
    const next = new Date(this.archiveFrom.getFullYear(), this.archiveFrom.getMonth() + 1, 1);
    if (next.getTime() > Date.now()) return;
    this.archiveFrom = next;
    this.archiveTo = new Date(this.archiveFrom.getFullYear(), this.archiveFrom.getMonth() + 1, 1);
    this.refresh();
  }

  public previousPeriod() {
    const previous = new Date(this.archiveFrom.getFullYear(), this.archiveFrom.getMonth() - 1, 1);
    this.archiveFrom = previous;
    this.archiveTo = new Date(this.archiveFrom.getFullYear(), this.archiveFrom.getMonth() + 1, 1);
    this.refresh();
  }

  getItemsName(val: ITransaction[]) {
    return val.map(it => it.product.productType).join('\n');
  }

  onFiltered() {
    super.onFiltered();
    this.updateMetadata();
  }

  onItemClick(event: IOrder) {
    this.onRowClick(event);

    const now = Date.now();

    if (this.clickInfo.element === event) { // same item
      const diff = now - (this.clickInfo.date || 0);

      if (diff < 250) {
        this.showToEdit();
      }
    }

    this.clickInfo = {
      date: now,
      element: event
    };
  }

  orderByDate(a: IOrder, b: IOrder) {
    const dateA = new Date(a.date).getFullYear();
    const dateB = new Date(b.date).getFullYear();
    return dateA - dateB;
  }

  showToEdit() {
    this.orderDialog = true;
  }

  closeEditDialog() {
    this.orderDialog = false;
  }

  getDifference(val: ITransaction) {
    const diff = (val.quantity * val.price) - (val.quantity * val.product.recommendedBuyPrice);
    return diff;
  }

  getProfit(val: IOrder) {
    let profit = 0;
    for (let i = 0; i < val.products.length; i++) {
      profit = profit + this.getDifference(val.products[i]);
    }
    return profit;
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

  onSort() {
    this.updateMetadata();
  }

  getDateKey(d: Date) {
    return `${d.getDate()}`;
  }

  public showHistory() {
    this.showOrderHistory = true;
    this.orderHistory = undefined;
    this.apiService.getOrderHistory(this.selectedItem.id).subscribe(
      res => {
        this.orderHistory = res.items;
      }
    );
  }

  private updateMetadata() {
    this.rowGroupMetadata = this.updateRowGroupMetaData(this.viewData);
  }

  private updateRowGroupMetaData(orders: IOrder[]) {
    const metadata = {};
    if (!orders) return;

    for (let i = 0; i < orders.length; i++) {
      const rowData = orders[i];
      const date = this.getDateKey(rowData.openDate);
      if (i === 0) {
        metadata[date] = { index: 0, size: 1 };
      } else {
        const previousRowData = orders[i - 1];
        const previousRowGroup = this.getDateKey(previousRowData.openDate);
        if (date === previousRowGroup)
          metadata[date].size++;
        else
          metadata[date] = { index: i, size: 1 };
      }
    }
    return metadata;
  }

}
