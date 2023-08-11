import { IApiSalePerUser, IApiWarehouseAction, IApiSale, IApiOrdersOverview } from './../../models/api/reports/sales';
import { UserService } from './user.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiBase } from '../api/base';
import { ApiResponse } from './../../models/api';
import { IUser, ISUser, IUserToEdit, IChangePassword } from '../../models/manage/user';
import { IProduct } from './../../models/storage/products';
import { IWarehouse } from '../../models/storage/werehouse';
import { ICategory } from './../../models/storage/categories';
import { IOrder, ISaleOrder, IOrderAction, OrderOperation, DeliveryKind, deliveryTypes, IApiOrderMoveCommand } from './../../models/storage/order';
import { ICancelOrder } from '../../models/storage/index';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

export function getDeliveryDescriptor(delivery: DeliveryKind) {
    const type = delivery ?? DeliveryKind.Other;
    const result = deliveryTypes.find(dt => dt.value === type);
    return result?.label || 'Невідомо'
}

@Injectable()
export class ApiService extends ApiBase {
    constructor(http: HttpClient, userService: UserService) {
        super(http, userService);
    }

    checkAuth(): Observable<ApiResponse<boolean>> { return this.doPost('account/auth', {}); }

    login(data): Observable<ApiResponse<IUser>> {
        return this.doPost('account/login', data);
    }

    logout(): Observable<ApiResponse<any>> { return this.doPost('account/logout', {}); }

    // orders method
    getOrders(): Observable<ApiResponse<IOrder>> {
        return this.doGet('order').pipe(tap((res: ApiResponse<IOrder>) => {
            res.items?.map(order => {
                order.deliveryString = getDeliveryDescriptor(order.delivery);
            })
        }));
    }

    // orders method
    getOrdersArchive(from: Date, to: Date): Observable<ApiResponse<IOrder>> {
        return this.doGet(`order/archive/${from.getTime()}/${to.getTime()}`);
    }

    // orders method
    getOrderHistory(id: number): Observable<ApiResponse<IOrderAction>> {
        return this.doGet<IOrderAction>(`order/${id}/history`).pipe(
            tap(res => {
                res.items.map(it => {
                    it.date = new Date(it.date);
                    it.orderJson = JSON.parse(it.orderJson as string);
                    it.prettyJson = JSON.stringify(it.orderJson, null, 2);
                    switch (it.operation) {
                        case OrderOperation.Canceled: {
                            it.operationName = 'Скасовано';
                            break;
                        }
                        case OrderOperation.Created: {
                            it.operationName = 'Створено';
                            break;
                        }
                        case OrderOperation.Updated: {
                            it.operationName = 'Оновлено';
                            break;
                        }
                        case OrderOperation.Closed: {
                            it.operationName = 'Закрито';
                            break;
                        }
                        default: {
                            it.operationName = 'Не задано';
                            break;
                        }
                    }
                });
            }));
    }

    getCanceledOrders(): Observable<ApiResponse<IOrder>> {
        return this.doGet('order/canceled');
    }

    moveOrderToDelivered(data: IApiOrderMoveCommand): Observable<ApiResponse<any>> {
        return this.doPost('order/move/delivered', data);
    }

    moveOrderToShipping(data: IApiOrderMoveCommand): Observable<ApiResponse<any>> {
        return this.doPost('order/move/shipping', data);
    }
    
    moveOrderToProcessing(data: IApiOrderMoveCommand): Observable<ApiResponse<any>> {
        return this.doPost('order/move/processing', data);
    }

    saveOrder(data: IOrder): Observable<ApiResponse<any>> {
        return this.doPost('order', data);
    }

    smsOrder(id: number) {
        return this.doPost(`order/${id}/sms/`, {});
    }

    сancelOrder(id: number, data: ICancelOrder) {
        return this.doPost('order/reject/' + id, data);
    }
    // storage method
    getCategories(): Observable<ApiResponse<ICategory>> {
        return this.doGet('category');
    }

    getProducts(): Observable<ApiResponse<IProduct>> {
        return this.doGet('product');
    }

    editProduct(data): Observable<any> {
        return this.doPost('product', data);
    }

    deleteProduct(id) {
        return this.doDelete('product', id);
    }

    addProduct(data): Observable<ApiResponse<number>> {
        return this.doPut('product', data);
    }

    getWarehouses(): Observable<ApiResponse<IWarehouse>> {
        return this.doGet('warehouse');
    }

    // transfer method
    doTransfer(id: number, data) {
        return this.doPost('product/' + id + '/transfer/', data);
    }
    // addition method
    addProductsToWarehouse(id: number, data) {
        return this.doPost('product/' + id + '/add/', data);
    }

    // removeProducts method
    removeProductsFromWarehouse(id: number, data) {
        return this.doPost('product/' + id + '/remove/', data);
    }

    // sale method
    sale(data: ISaleOrder) {
        return this.doPost('product/sell/', data);
    }

    // manage method
    getUsers(): Observable<ApiResponse<ISUser>> {
        return this.doGet('user');
    }

    editUser(id: string, user: IUserToEdit): Observable<any> {
        return this.doPost('user/' + id, user);
    }

    addUser(user: ISUser): Observable<ApiResponse<string>> {
        return this.doPut('user', user);
    }

    deleteUser(id) {
        return this.doDelete('user', id);
    }

    changePassword(data): Observable<ApiResponse<IChangePassword>> {
        return this.doPost('account/changePassword', data);
    }

    // forgot password
    forgotPassword(data) {
        return this.doPost('account/forgot-password', data);
    }

    /// REPORTS ===================================

    getSalesPerUser(from: Date, to: Date): Observable<ApiResponse<IApiSalePerUser>> {
        to = to || new Date(from.getFullYear(), from.getMonth(), from.getDate() + 1);
        return this.doGet('reports/sales-per-user/' + from.getTime() + '/' + to.getTime());
    }

    getOrdersOverview(from: Date, to: Date): Observable<ApiResponse<IApiOrdersOverview>> {
        to = to || new Date(from.getFullYear(), from.getMonth(), from.getDate() + 1);
        return this.doGet('reports/orders-overview/' + from.getTime() + '/' + to.getTime());
    }

    getWarehouseActions(from: Date, to: Date): Observable<ApiResponse<IApiWarehouseAction>> {
        to = to || new Date(from.getFullYear(), from.getMonth(), from.getDate() + 1);
        return this.doGet('reports/warehouse-actions/' + from.getTime() + '/' + to.getTime());
    }

    getSalesPerProduct(from: Date, to: Date): Observable<ApiResponse<IApiSale>> {
        to = to || new Date(from.getFullYear(), from.getMonth(), from.getDate() + 1);
        return this.doGet('reports/sales-per-product/' + from.getTime() + '/' + to.getTime());
    }

    getOpenOrders(): Observable<ApiResponse<string>> {
        return this.doGet('reports/open-orders');
    }

    getOpenOrdersLight(): Observable<ApiResponse<string>> {
        return this.doGet('reports/open-orders/light');
    }
}
