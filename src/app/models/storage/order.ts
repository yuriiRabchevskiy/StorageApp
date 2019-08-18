import { ISell } from './sell';
import { IProduct } from './products';

export enum OrderStatus { Open = 0, Closed = 1, Processing = 2, Canceled = 3 }
export enum PaymentKind { payed = 0, cashOnDelivery = 1 }

export interface IOrder {
    id: number;
    totalPrice?: number;
    clientPhone?: string;
    clientName?: string;
    clientAddress?: string;
    orderNumber?: number;
    other?: string;
    status?: OrderStatus;
    payment?: PaymentKind;
    openDate?: Date;
    closeDate?: Date;
    seller?: string;
    products?: ITransaction[]; // to display for user

    // client properties
    date?: string;
    itemsName?: string;

}

export interface ISaleOrder extends IOrder {
    productOrders: ISell[];
}

export interface ITransaction {
    product: IProduct;
    quantity: number;
    price: number;
    buyPrice: number;
    totalPrice: number;
}

export class Order implements IOrder {
    id: number;
    totalPrice?: number;
    clientPhone?: string;
    clientName?: string;
    clientAddress?: string;
    orderNumber?: number;
    other?: string;
    status?: OrderStatus = OrderStatus.Open;
    payment?: PaymentKind = PaymentKind.cashOnDelivery;
    openDate?: Date;
    closeDate?: Date;
    seller?: string;

    products?: ITransaction[]; // to display for user

    public constructor() { }

}

export class SaleOrder extends Order implements ISaleOrder {
    productOrders: ISell[] = [];
}


export interface ICancelOrder {
    reason: string;
}

export class CancelOrder implements ICancelOrder {

    public constructor(public reason: string) { }
}
