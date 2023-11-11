import { Injectable } from '@angular/core';
import { IOrder } from '@app/models/storage';
import { IProdOrder } from '@app/models/storage/products';


@Injectable({ providedIn: 'root' })
export class BasketService {

    public get hasItems() {
        return this.sellList && this.sellList.length > 0;
    }
    public sellList: IProdOrder[] = [];

    public reset() { this.sellList = []; }

    public restore(order: IOrder) {
        this.reset();
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