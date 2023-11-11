import { ISell } from './sell';
import { IProduct } from './products';

export enum OrderStatus { Open = 0, Delivered = 1, Shipping = 2, Canceled = 3, Processing = 4 }
export enum PaymentKind { payed = 0, cashOnDelivery = 1 }
export enum DeliveryKind { Other, NewPost, UkrPost, SelfDelivery, LvivTransfer, Drop }

export const deliveryTypes = [
    { label: 'Нова Пошта', value: DeliveryKind.NewPost },
    { label: 'Укрпошта', value: DeliveryKind.UkrPost },
    { label: 'Самовивіз', value: DeliveryKind.SelfDelivery },
    { label: 'По Львову', value: DeliveryKind.LvivTransfer },
    { label: 'Дроп', value: DeliveryKind.Drop },
    { label: 'Інше', value: DeliveryKind.Other },
];

export interface IApiOrderMoveCommand {
    ids: number[];
}

export interface IOrder {
    id: number;
    totalPrice?: number;
    clientPhone?: string;
    clientName?: string;
    clientAddress?: string;
    orderNumber?: string;
    other?: string;
    status?: OrderStatus;
    payment?: PaymentKind;
    delivery?: DeliveryKind;
    deliveryString?: string;
    openDate?: Date;
    closeDate?: Date;
    seller?: string;
    products?: ITransaction[]; // to display for user

    // client properties
    date?: string;
    sellerShort?: string;
    itemsName?: string;
    isChecked?: boolean;
}

export enum OrderOperation { Created, Updated, Closed, Canceled }

export interface IOrderAction {
    id: number;
    orderId: number;
    user: string;
    date: Date;
    note: string;
    orderJson: string | IOrder;
    operation: OrderOperation;

    operationName?: string;
    prettyJson: string;
}

export interface ISaleOrder extends IOrder {
    productOrders: ISell[];
}

export interface IEditSaleOrder {
    productOrders: ISell[];
}

export interface ITransaction {
    product: IProduct;
    quantity: number;
    price: number;
    buyPrice: number;
    totalPrice: number;
    warehouseId: number;
}

export class Order implements IOrder {
    id: number;
    totalPrice?: number;
    clientPhone?: string;
    clientName?: string;
    clientAddress?: string;
    orderNumber?: string;
    other?: string;
    status?: OrderStatus = OrderStatus.Open;
    payment?: PaymentKind = PaymentKind.cashOnDelivery;
    delivery?: DeliveryKind;
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
