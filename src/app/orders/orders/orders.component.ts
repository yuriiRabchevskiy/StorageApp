import { Component, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment-mini';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { ApiResponse } from '../../models/api';
import { ApiOrdersChanges } from '../../models/api/state/state';
import { ApiListComponent } from '../../models/component/list-api.component';
import { NumberFilter, StringFilter } from '../../models/filtering/filters';
import { IOrder, ITransaction, OrderStatus, IOrderAction } from '../../models/storage';
import { ApiService } from '../../shared/services/api.service';
import { TrackerService } from '../../shared/services/tracker.service';
import { Dictionary, IDictionary } from './../../models/dictionary';

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

interface IDoubleClick {
    date?: number;
    element?: IOrder;
}

@Component({
    selector: 'app-orders',
    templateUrl: './orders.component.html',
    styleUrls: ['./orders.component.scss']
})
export class OrdersComponent extends ApiListComponent<IOrder> implements OnDestroy {
    @ViewChild('dt', { static: true }) public dataTable: Table;
    public selectedItem: IOrder;
    public orderDialog: boolean = false;
    public showConfirm: boolean = false;
    public showConfirmCancel: boolean = false;
    public showOrderHistory: boolean = false;
    public typeFilter: NumberFilter<IOrder> = new NumberFilter<IOrder>();
    public stringFilters: StringFilter<IOrder> = new StringFilter<IOrder>();
    public rowGroupMetadata: IDictionary<any>;
    public canceledRowGroupMetadata: IDictionary<any>;

    public orderHistory: IOrderAction[] = [];

    public isCancelTab: boolean = false;
    public canceledOrders: IOrder[] = [];
    public canceledOrdersIsLoading: boolean = false;
    private _canceledLoadTimeMs: number = undefined;
    public clickInfo: IDoubleClick = {};

    get rowMetadata() {
        return this.isCancelTab ? this.canceledRowGroupMetadata : this.rowGroupMetadata;
    }

    get viewData() {
        return this.isCancelTab ? this.canceledOrders : this.filteredData;
    }

    tabs: ITab[] = [{ label: 'Прийняті', value: OrderStatus.Open },
    { label: 'Відправлені', value: OrderStatus.Processing },
    { label: 'Отримані', value: OrderStatus.Closed }
    ];

    private _selectedTab: ITab;
    public get selectedTab() { return this._selectedTab; }
    public set selectedTab(value: ITab) {
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
    };

    itemsFormatted = [];

    constructor(private apiService: ApiService, public router: Router, notifi: MessageService,
        private tracker: TrackerService) {
        super(notifi);

        this.tracker.orderChanged.on(this.onOrdersChanged);
        const isAdmin = this.userService.getLocal().isAdmin;
        if (isAdmin) this.tabs.push({ label: 'Скасовані', value: OrderStatus.Canceled });
        this.selectedTab = this.tabs[0];
        this.typeFilter.getNumber = (it) => it.status;
        this.filters.push(this.typeFilter);
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
            console.log(diff);

            if (diff < 250) {
                this.showToEdit();
            }
        }

        this.clickInfo = {
            date: now,
            element: event
        };



    }

    selectTab(index: number) {
        this.selectedTab = this.tabs[index];
        if (this.filteredData.length < -1) return;
        this.select(this.filteredData[0]);
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

    getItemsName(val: ITransaction[]) {
        return val.map(it => it.product.productType).join('\n');
    }

    orderByDate(a, b) {
        const dateA = new Date(a.date).getFullYear();
        const dateB = new Date(b.date).getFullYear();
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
        const item = val;
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

        const order = this.selectedItem;
        this.apiService.сancelOrder(order.id, val.item).subscribe(
            res => {
                if (res.success) {
                    this.showSuccessMessage('Продажу повернено');
                    if (this.filteredData.length < 1) return;
                    if (this.selectedItem.id === order.id) {
                        this.remove(order);
                    }
                    this.select(this.filteredData[0]);
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
                res.items.forEach(it => it.openDate = new Date(it.openDate));
                this.canceledOrders = res.items;
                this.canceledRowGroupMetadata = this.updateRowGroupMetaData(this.canceledOrders);
            },
            err => this.canceledOrdersIsLoading = false
        );
    }

    getDifference(val) {
        const diff = (val.quantity * val.price) - (val.quantity * val.product.recommendedBuyPrice);
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

    private updateMetadata() {
        this.rowGroupMetadata = this.updateRowGroupMetaData(this.viewData);
        this.canceledRowGroupMetadata = this.updateRowGroupMetaData(this.canceledOrders);
    }

    updateRowGroupMetaData(orders: IOrder[]) {
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

    private onOrdersChanged = (info: ApiOrdersChanges) => {
        console.log('products count changed', info);
        info.changes.forEach(orderChange => {
            const current = this.data.find(it => it.id === orderChange.orderId);
            const originalProducts = current.products;
            Object.assign(current, orderChange.order);
            current.products = originalProducts; // restore as unmodifiable
            current.openDate = new Date(current.openDate); // open date
        });
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

    ngOnDestroy(): void {
        this.tracker.orderChanged.off(this.onOrdersChanged);
    }
}
