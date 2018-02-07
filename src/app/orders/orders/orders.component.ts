import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { ApiListComponent } from '../../models/component/list-api.component';
import { ApiResponse } from '../../models/api';
import { Router } from '@angular/router';
import { NumberFilter, StringFilter } from '../../models/filtering/filters';
import { IOrder, OrderStatus } from '../../models/storage';
import * as moment from 'moment-mini';
import { MessageService } from 'primeng/components/common/messageservice';
import { DataTable } from 'primeng/primeng';

@Component({
    selector: 'app-orders',
    templateUrl: './orders.component.html',
    styleUrls: ['./orders.component.scss']
})
export class OrdersComponent extends ApiListComponent<IOrder> {
    @ViewChild('dt') dataTable: DataTable;
    selectedItem: IOrder;
    orderDialog: boolean = false;
    showConfirm: boolean = false;
    showConfirmCancel: boolean = false;
    typeFilter: NumberFilter<IOrder> = new NumberFilter<IOrder>();
    stringFilters: StringFilter<IOrder> = new StringFilter<IOrder>();

    tabs = [{ label: 'Прийнятий', value: OrderStatus.Open },
    { label: 'Відправлений', value: OrderStatus.Processing },
    { label: 'Отриманий', value: OrderStatus.Closed }
    ];

    _selectedTab: any;
    get selectedTab() {
        return this._selectedTab;
    }
    set selectedTab(value: any) {
        if (this._selectedTab === value) return;
        this._selectedTab = value;
        this.typeFilter.number = value.value;
        this.filter();
    }
    constructor(private apiService: ApiService, public router: Router,
        private notifi: MessageService) {
        super();
        this.selectedTab = this.tabs[0];
        this.typeFilter.getNumber = (it) => it.status;
        this.filters.push(this.typeFilter);
    }

    onRowClick(val) {
        if (this.selectedItem !== val.data) return;
        this.showToEdit();
    }

    selectTab(event) {
        this.selectedTab = this.tabs[event.index];
    }

    doGetData() {
        return this.apiService.getOrders();
    }

    onDataReceived(res: ApiResponse<IOrder>) {
        if (res.success) {
            res.items.map(it =>
                Object.keys(it).map(date => it['date'] = moment(new Date(it.openDate)).format('DD/MM/YYYY')));
            res.items.map(it =>
                Object.keys(it).map(itemsName => it['itemsName'] = this.getItemsName(it.products)));
            res.items.sort(this.orderByDate);
        }
        super.onDataReceived(res);
    }

    getItemsName(val) {
        let items = [];
        let name = '';
        for (let i = 0; i < val.length; i++) {
            if (i === 0) {
                name = val[i].product.productType;
            } else {
                name = '\n' + val[i].product.productType;
            }
            items.push(name);
        }
        return items;
    }

    orderByDate(a, b) {
        let dateA = new Date(a.date).getFullYear();
        let dateB = new Date(b.date).getFullYear();
        return dateA - dateB;
    }

    showToEdit() {
        this.orderDialog = true;
    }

    closeEditDialog(event) {
        this.orderDialog = event;
        if (this.filteredData.length < 1) return;
        this.selectedItem = this.filteredData[0];
    }

    save(val: IOrder) {
        let item = val;
        this.apiService.saveOrder(item).subscribe(
            res => {
                this.notifi.add({
                    severity: 'success',
                    summary: 'Successfully',
                    detail: 'Зміни збережено'
                });
                this.filter();
            },
            err => {
                this.notifi.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Зміни зберегти не вдалося' + err
                });
            }
        );
        this.orderDialog = false;
    }

    confirmCloseOrder(val: boolean) {
        if (!val) {
            this.showConfirm = false;
            return;
        }
        this.selectedItem.status = OrderStatus.Closed;
        this.apiService.saveOrder(this.selectedItem).subscribe(
            res => {
                this.notifi.add({
                    severity: 'success',
                    summary: 'Successfully',
                    detail: 'Продажу закрито'
                });
                this.filter();
            },
            err => {
                this.notifi.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Продажу закрити не вдалося' + err
                });
            }
        );
        this.showConfirm = false;
    }

    closeCancelOrder(val) {
        if (!val.conf) {
            this.showConfirmCancel = val.conf;
            return;
        }
        this.apiService.сancelOrder(this.selectedItem.id, val.item).subscribe(
            res => {
                this.notifi.add({
                    severity: 'success',
                    summary: 'Successfully',
                    detail: 'Продажу повернено'
                });
                if (this.filteredData.length < 1) return;
                this.remove(this.selectedItem);
                this.selectedItem = this.filteredData[0];
            },
            err => {
                this.notifi.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Продажу повернути не вдалося' + err
                });
            }
        );
        this.showConfirmCancel = false;
    }
    getDifference(val) {
        let diff = (val.quantity * val.price) - (val.quantity * val.product.recommendedBuyPrice);
        return diff;
    }
    getProfit(val) {
        let profit = 0;
        for (let i = 0; i < val.products.length; i++) {
            profit = profit + this.getDifference(val.products[i]);
        }
        return profit;
    }

    confCancel() {
        this.showConfirmCancel = true;
    }

    confirmation() {
        this.showConfirm = true;
    }

    expandOrders() {
        let data = [];
        this.filteredData.forEach(it => {
            data.push(it);
        });
        this.dataTable.expandedRows = data;
    }

    collapseOrders() {
        this.dataTable.expandedRows = [];
    }
}
