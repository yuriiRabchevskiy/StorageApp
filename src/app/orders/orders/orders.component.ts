import { Component, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { PreferenceService } from '@app/shared/services/preference.service';
import { UserService } from '@app/shared/services/user.service';
import { groupBy } from 'lodash';
import * as moment from 'moment-mini';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { ApiResponse } from '../../models/api';
import { ApiOrdersChanges } from '../../models/api/state/state';
import { ApiListComponent, ITableColumn } from '../../models/component/list-api.component';
import { NumberFilter, StringFilter } from '../../models/filtering/filters';
import { IOrder, ITransaction, OrderStatus, IOrderAction, buildProductFullName } from '../../models/storage';
import { ApiService, getDeliveryDescriptor } from '../../shared/services/api.service';
import { TrackerService } from '../../shared/services/tracker.service';
import { Dictionary, IDictionary } from './../../models/dictionary';
import { Observable } from 'rxjs';
import { BasketService } from '@app/shared/services/basket.service';

type MoveToAction = (apiService: ApiService, ids: number[]) => Observable<ApiResponse<any>>;

interface ITab {
    label: string;
    value: OrderStatus;
}

interface IDoubleClick {
    date?: number;
    element?: IOrder;
}

interface IMoveToInfo {
    title: string;
    desiredStatus: OrderStatus;
    apiActionExecutor: MoveToAction;
}

@Component({
    selector: 'app-orders',
    templateUrl: './orders.component.html',
    styleUrls: ['./orders.component.scss']
})
export class OrdersComponent extends ApiListComponent<IOrder> implements OnDestroy {
    @ViewChild('dt', { static: true }) public dataTable: Table;

    buildProductFullName = buildProductFullName;

    public selectedItem: IOrder;
    public orderDialog: boolean = false;
    public showConfirm: boolean = false;
    public showConfirmMoveTo: boolean = false;
    public showConfirmMassSms: boolean = false;
    public showConfirmCancel: boolean = false;
    public showOrderHistory: boolean = false;
    public typeFilter: NumberFilter<IOrder> = new NumberFilter<IOrder>();
    public stringFilters: StringFilter<IOrder> = new StringFilter<IOrder>();
    public rowGroupMetadata: IDictionary<any>;
    public canceledRowGroupMetadata: IDictionary<any>;

    public orderHistory: IOrderAction[] = [];

    public isCancelTab: boolean = false;
    public isProcessingTab: boolean = false;
    public canceledOrders: IOrder[] = [];
    public canceledOrdersIsLoading: boolean = false;
    private _canceledLoadTimeMs: number = undefined;
    public clickInfo: IDoubleClick = {};

    public get canViewMassActions() {
        if (!this.moveToInfo) return false;
        if (this.canView) return true;
        return (this.isWarehouseManager && this.selectedTab.value == OrderStatus.Open);
    }

    public get visibleOrders(): IOrder[] {
        return (this.dataTable.filteredValue ?? this.dataTable.value ?? []);
    }

    public get chosenVisibleOrders(): IOrder[]  {
        return this.visibleOrders.filter(it => it.isChecked);
    }

    public columns: ITableColumn[] = [
        { title: 'Дата продажу', field: 'openDate', width: 114, template: 'date', format: 'dd/MM/yy HH:mm', },
        {
            title: 'Дата закриття', field: 'closeDate', width: 114, template: 'date', format: 'dd/MM/yy HH:mm',
            shouldHideFunc: () => this.selectedTab.value !== 1
        },
        {
            title: 'Дата відміни', field: 'cancelDate', width: 114, template: 'date', format: 'dd/MM/yy HH:mm',
            shouldHideFunc: () => this.selectedTab.value !== 3
        },
        { title: 'Накладна', field: 'orderNumber', width: 126, template: 'pageSpecial1' },
        { title: 'Смс', field: '', width: 60, shouldHideFunc: () => !this.isProcessingTab, template: 'actions' },
        { title: 'Телефон', field: 'clientPhone', width: 92, },
        { title: 'Одержувач', field: 'clientName' },
        { title: 'Адреса', field: 'clientAddress', maxWidth: 140 },
        // { title: 'Тип Оплати', field: 'payment', width: 108, template: 'pageSpecial2' },
        { title: 'Доставка', field: 'deliveryString', width: 108 },
        { title: 'Продавець', field: 'sellerShort', width: 90 },
        { title: 'Скасував', field: 'canceledBy', shouldHideFunc: () => !this.isCancelTab },
        { title: 'Товари', field: 'itemsName', width: 180 },
        { title: 'Нотатки', field: 'other', template: 'pageSpecial3' },
        {
            title: 'Сума', field: 'totalPrice', width: 80,
            shouldHideFunc: () => this.isCancelTab
        },
    ];

    get isMoveToAllCbChecked() {
        return this.visibleOrders.length && this.visibleOrders.some(it => it.isChecked);
    }

    get isMoveToAllIndeterminate() {
        if (!this.visibleOrders.length) return false;
        const first = this.visibleOrders[0].isChecked;
        return this.visibleOrders.some(it => it.isChecked !== first);
    }

    get moveToInfo(): IMoveToInfo | undefined {

        switch (this.selectedTab.value) {
            case OrderStatus.Open: return {
                title: 'з прийняті у комплектується',
                desiredStatus: OrderStatus.Shipping,
                apiActionExecutor: (apiService, ids) => apiService.moveOrderToProcessing({ ids })
            };
            case OrderStatus.Processing: return {
                title: 'з комплектується у відправлені',
                desiredStatus: OrderStatus.Shipping,
                apiActionExecutor: (apiService, ids) => apiService.moveOrderToShipping({ ids })
            };
            case OrderStatus.Shipping: return {
                title: 'з відправлені у отримані',
                desiredStatus: OrderStatus.Delivered,
                apiActionExecutor: (apiService, ids) => apiService.moveOrderToDelivered({ ids })
            };
        }

        return null;
    }

    get rowMetadata() {
        return this.isCancelTab ? this.canceledRowGroupMetadata : this.rowGroupMetadata;
    }

    get viewData() {
        return this.isCancelTab ? this.canceledOrders : this.filteredData;
    }

    tabs: ITab[] =
        [
            { label: 'Прийняті', value: OrderStatus.Open },
            { label: 'Комплектується', value: OrderStatus.Processing },
            { label: 'Відправлені', value: OrderStatus.Shipping },
            { label: 'Отримані', value: OrderStatus.Delivered }
        ];

    private _selectedTab: ITab;
    public get selectedTab() { return this._selectedTab; }
    public set selectedTab(value: ITab) {
        if (this._selectedTab === value) return;
        this._selectedTab = value;
        this.typeFilter.number = value.value;
        this.isCancelTab = this.selectedTab.value === OrderStatus.Canceled;
        this.isProcessingTab = this.selectedTab.value === OrderStatus.Processing;

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

    constructor(userService: UserService, private apiService: ApiService, 
        public router: Router, private tracker: TrackerService, public basketService:BasketService,
        notify: MessageService, preferences: PreferenceService) {
        super(userService, notify, preferences);

        this.tracker.orderChanged.on(this.onOrdersChanged);
        const isAdmin = this.userService.getLocal().isAdmin;
        if (isAdmin) this.tabs.push({ label: 'Скасовані', value: OrderStatus.Canceled });
        this.selectedTab = this.tabs[0];
        this.typeFilter.getNumber = (it) => it.status;
        this.filters.push(this.typeFilter);

        this.initHiddenColumns('ordersColumns');
    }


    onFiltered() {
        super.onFiltered();
        this.updateMetadata();
    }

    onMoveToAllChange(_: InputEvent) {
        const val = (_.target as any).checked;
        this.visibleOrders.map(it => it.isChecked = val);
    }

    onCheckedChange(order: IOrder, _: InputEvent) {
        const val = (_.target as any).checked;
        order.isChecked = val;
        const realData = this.data.find(it => it.id === order.id);
        realData.isChecked = val;
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
                const sellerSrName = it.seller?.split(' ');
                if (sellerSrName && sellerSrName.length > 1) {
                    it.sellerShort = `${sellerSrName[0]} ${sellerSrName[1][0]}.`;
                } else {
                    it.sellerShort = it.seller;
                }
            });
            res.items.sort(this.orderByDate);
        }
        super.onDataReceived(res);
        this.updateMetadata();
    }

    getItemsName(val: ITransaction[]) {
        const allTypes = val.map(it => it.product.productType);
        const group = groupBy(allTypes);
        const keys = Object.keys(group);
        const unique = keys.filter(it => group[it].length < 2);
        const duplicates = keys.filter(it => group[it].length >= 2).map(it => `${it} x${group[it].length}`);
        return unique.concat(duplicates).sort().join(',');
    }

    orderByDate(a, b) {
        const dateA = new Date(a.date).getFullYear();
        const dateB = new Date(b.date).getFullYear();
        return dateA - dateB;
    }

    showToEdit() {
        if(this.isWarehouseManager) return;
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
        this.selectedItem.status = OrderStatus.Delivered;
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

    restoreBasket() {
       this.basketService.restore(this.selectedItem);
       this.showInfoMessage("Замовлення відновлено і може бути редаговане на сторінці Складу");
    }

    async confirmMoveTo(val: boolean) {
        if (!val) {
            this.showConfirmMoveTo = false;
            return;
        }

        const moveToInfo = this.moveToInfo;

        const data = this.chosenVisibleOrders;
        const ids = data.map(it => it.id);
        moveToInfo.apiActionExecutor(this.apiService, ids).subscribe({
            next: (res: ApiResponse<any>) => {
                if (res.success) {
                    data.forEach(d => d.status = moveToInfo.desiredStatus);
                    this.filter();
                    return;
                }
                this.showApiErrorMessage('не вдалося змінити статус продаж, оновіть сторінку', res.errors)
            },
            error: (err) => {
                this.showWebErrorMessage(`не вдалося змінити статус продаж, оновіть сторінку`, err);
            }
        });

        this.showConfirmMoveTo = false;
    }

    confirmMassSms(val: boolean) {
        if (!val) {
            this.showConfirmMassSms = false;
            return;
        }

        const data = this.chosenVisibleOrders;
        data.forEach(itm => this.sentSms(itm));
        this.showConfirmMassSms = false;
    }

    closeCancelOrder(val) {
        if (!val.conf) {
            this.showConfirmCancel = val.conf;
            return;
        }

        const order = this.selectedItem;
        this.apiService.cancelOrder(order.id, val.item).subscribe(
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
                res.items.forEach(it => {
                    it.openDate = new Date(it.openDate);
                });
                this.canceledOrders = res.items;
                this.canceledRowGroupMetadata = this.updateRowGroupMetaData(this.canceledOrders);
            },
            err => this.canceledOrdersIsLoading = false
        );
    }

    getDifference(val) {
        const diff = (val.quantity * val.price) - (val.quantity * val.buyPrice);
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

    sentSms(order: IOrder) {
        this.apiService.smsOrder(order.id).subscribe(
            res => {
                if (res.success) {
                    this.showSuccessMessage(`Смс для клієнта ${order.clientName} відправлено успішно`);
                    return;
                }
                this.showApiErrorMessage('Смс для клієнта ${order.clientName} не відправлено', res.errors);
            },
            err => this.showWebErrorMessage(`Смс для клієнта ${order.clientName} не відправлено`, err)
        );
    }

    private onOrdersChanged = (info?: ApiOrdersChanges) => {
        console.log('products count changed', info);
        let shouldFilter = false;
        info.changes.forEach(orderChange => {
            const newOrder = orderChange.order;
            const current = this.data.find(it => it.id === orderChange.orderId);
            if (!current) return;
            const statusChanged = current.status != newOrder.status;
            const originalProducts = current.products;
            shouldFilter = shouldFilter || statusChanged;
            Object.assign(current, orderChange.order);
            current.deliveryString = getDeliveryDescriptor(newOrder.delivery);
            current.products = originalProducts; // restore as unmodifiable
            current.openDate = new Date(current.openDate); // open date
        });
        if (shouldFilter) {
            this.filter();
        }
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
