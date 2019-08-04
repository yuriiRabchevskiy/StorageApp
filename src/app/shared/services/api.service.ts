import { IApiSalePerUser, IApiWarehouseAction, IApiSale, IApiOrdersOverview } from './../../models/api/reports/sales';
import { UserService } from './user.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { ApiBase } from '../api/base';
import { ApiResponse } from './../../models/api';
import { IUser, ISUser, IUserToEdit, IChangePassword } from '../../models/manage/user';
import { IProduct } from './../../models/storage/products';
import { IWarehouse } from '../../models/storage/werehouse';
import { ICategory } from './../../models/storage/categories';
import { IOrder, ISaleOrder } from './../../models/storage/order';
import { ICancelOrder } from '../../models/storage/index';
import { HttpClient } from '@angular/common/http';

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
        return this.doGet('order');
    }

    getCanceledOrders(): Observable<ApiResponse<IOrder>> {
        return this.doGet('order/canceled');
    }

    saveOrder(data): Observable<ApiResponse<any>> {
        return this.doPost('order', data);
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
