import { IOrder, Order, OrderStatus } from './order';

export interface ISell {
    idProduct: number;
    fromId: number;
    quantity: number;
    description?: string;
    price: number;
}

export class Sell implements ISell {
    idProduct: number;
    fromId: number;
    quantity: number = 1;
    description?: string;
    price: number;
    public constructor(price: number) {
        this.price = price;
    }
}
