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
import { UserService } from '../../shared/services/user.service';

interface ITab {
    label: string;
    value: OrderStatus;
}
interface IExportData {
    id: number;
    date: string;
    itemsName: any;
    orderNumber: number;
    seller: string;
}
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

    isCancelTab: boolean = false;
    canceledOrders: IOrder[] = [];
    canceledOrdersIsLoading: boolean = false;
    private _canceledLoadTimeMs: number = undefined;

    get viewData() {
        return this.isCancelTab ? this.canceledOrders : this.filteredData;
    }

    tabs: ITab[] = [{ label: 'Прийняті', value: OrderStatus.Open },
    { label: 'Відправлені', value: OrderStatus.Processing },
    { label: 'Отримані', value: OrderStatus.Closed }
    ];

    _selectedTab: ITab;
    get selectedTab() {
        return this._selectedTab;
    }
    set selectedTab(value: ITab) {
        if (this._selectedTab === value) return;
        this._selectedTab = value;
        this.typeFilter.number = value.value;
        this.isCancelTab = this.selectedTab.value === OrderStatus.Canceled;

        if (this.isCancelTab) {
            const now = new Date().getTime();
            const min15 = 15 * 60 * 1000;
            if (this._canceledLoadTimeMs && (now - this._canceledLoadTimeMs) <= min15) return;
            this.getCanceledOrders();
        } else {
            this.filter();
        }
    }

    csvFileName: string;
    headers = {
        id: '№',
        orderNumber: 'Номер накладної',
        date: 'Дата продажу',
        seller: 'Продавець',
        products: 'Товари'
    }

    itemsFormatted = [];

    constructor(private apiService: ApiService, public router: Router, notifi: MessageService) {
        super(notifi);

        const isAdmin = this.userService.getLocal().isAdmin;
        if (isAdmin) this.tabs.push({ label: 'Скасовані', value: OrderStatus.Canceled });
        this.selectedTab = this.tabs[0];
        this.typeFilter.getNumber = (it) => it.status;
        this.filters.push(this.typeFilter);
    }

    onRowClick(val) {
        if (this.selectedItem !== val.data) {
            this.selectedItem = val.data;
        } else {
            this.showToEdit();
        }
    }

    selectTab(event) {
        this.selectedTab = this.tabs[event.index];
        if (this.filteredData.length < -1) return;
        this.selectedItem = this.filteredData[0];
    }

    refresh() {
        if (this.isCancelTab) {
            this.getCanceledOrders();
            return;
        }
        super.refresh();
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
    }

    save(val: IOrder) {
        let item = val;
        this.apiService.saveOrder(item).subscribe(
            res => {
                if (res.success) {
                    this.showSuccessMessage('Зміни збережено');
                    this.filter();
                    return;
                }
                this.showApiErrorMessage('Не вдалося зберегти зміни', res.errors);
            },
            err => this.showWebErrorMessage('Не вдалося зберегти зміни', err)

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
                if (res.success) {
                    this.showSuccessMessage('Продажу закрито');
                    this.filter();
                    return;
                }
                this.showApiErrorMessage('Продажу не закрито', res.errors);
            },
            err => this.showWebErrorMessage('Продажу не закрито', err)
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
                if (res.success) {
                    this.showSuccessMessage('Продажу повернено');
                    if (this.filteredData.length < 1) return;
                    this.remove(this.selectedItem);
                    this.selectedItem = this.filteredData[0];
                    return;
                }
                this.showApiErrorMessage('Продажу не повернено', res.errors);
            },
            err => this.showWebErrorMessage('Продажу не повернено', err)
        );
        this.showConfirmCancel = false;
    }

    getCanceledOrders() {
        if (this.canceledOrdersIsLoading) return;
        this.canceledOrdersIsLoading = true;
        this.apiService.getCanceledOrders().subscribe(
            res => {
                this._canceledLoadTimeMs = new Date().getTime();
                this.canceledOrdersIsLoading = false;
                this.canceledOrders = res.items;
            },
            err => this.canceledOrdersIsLoading = false
        );
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

    createFileName() {
        let date = moment(new Date()).format('DD.MM.YYYY HH:mm');
        this.csvFileName = this.selectedTab.label + ' продажі - ' + date;
    }

    saveToExcel(data) {
        this.createFileName();
        this.formated(data);
        this.exportCSVFile(this.headers, this.itemsFormatted, this.csvFileName);
    }

    generateProductList(val) {
        let str = '';
        for (let i = 0; i < val.products.length; i++) {
            let color = val.products[i].product.color;
            let model = val.products[i].product.model;
            let type = val.products[i].product.productType;
            if (str !== '') {
                str += ';\u00A0';
            };
            str += (color || '') + ' ' + (model || '') + ' ' + (type || '');
        }
        return str;
    }
    formated(val) {
        this.itemsFormatted = [];
        val.forEach((item) => {
            let productList = this.generateProductList(item);
            this.itemsFormatted.push({
                id: item.id,
                orderNumber: item.orderNumber,
                date: item.date,
                seller: item.seller,
                products: productList
            });
        });
    }

    convertToCSV(objArray) {
        let array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
        let str = '';

        for (let i = 0; i < array.length; i++) {
            let line = '';
            for (let index in array[i]) {
                if (i === 0) {
                    if (line !== '') {
                        line += ',';
                    };
                    line += array[i][index];
                } else {
                    if (line !== '') {
                        line += ',';
                    };
                    line = line + array[i][index];
                }
            }
            str += line + '\r\n';
        }
        return str;
    }

    exportCSVFile(headers, items, fileTitle) {
        if (headers) {
            items.unshift(headers);
        }

        // Convert Object to JSON
        let jsonObject = JSON.stringify(items);
        let csv = this.convertToCSV(jsonObject);
        let fileName = fileTitle + '.csv' || 'export.csv';
        let blob = new Blob([csv], { type: 'text/csv; charset=utf-8' });
        if (navigator.msSaveBlob) {
            navigator.msSaveBlob(blob, fileName);
        } else {
            let link = document.createElement('a');
            if (link.download !== undefined) {
                let url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', fileName);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    }
}
