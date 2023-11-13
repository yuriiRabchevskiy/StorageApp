import { Injectable } from '@angular/core';
import { IOrder } from '@app/models/storage';
import { IProdOrder } from '@app/models/storage/products';


@Injectable({ providedIn: 'root' })
export class BasketService {

    public orderId: number = undefined;
    public sellList: IProdOrder[] = [];

    public get isEditing() {
        return this.orderId;
    }

    public get hasItems() {
        return this.sellList && this.sellList.length > 0;
    }
   

    public addItem(prod: IProdOrder) {
        const exists = this.sellList.find(it =>
            // we are adding the same product from the same warehouse 
            it.product.id == prod.product.id && it.prodOrder.fromId === prod.prodOrder.fromId);
        if (!exists) {
            this.sellList.push(prod);
            return;
        }

        exists.prodOrder.quantity += prod.prodOrder.quantity;
    }

    public removeItem(prod: IProdOrder) {
        const itemIndex = this.sellList.indexOf(prod);
        if (itemIndex < 0) return;
        this.sellList.splice(itemIndex, 1);
    }

    public reset() {
        this.sellList = [];
        this.orderId = undefined;
    }

    public restore(order: IOrder) {
        this.reset();
        this.orderId = order.id;
        const sellList: IProdOrder[] = order.products.map(p => {
            return {
                prodOrder: {
                    idProduct: p.product.id,
                    price: p.price,
                    quantity: p.quantity,
                    description: "RRRRRRRRRRRRRRRRRR",
                    fromId: p.warehouseId,
                },
                product: p.product
            };
        });
        this.sellList = sellList;
    }
}