export interface IApiSale {
    category: number;
    quantity: number;
    sales: number;
    buyPrice: number;
    profit: number;
}

export interface IApiSalePerUser extends IApiSale {
    ordersCount: number;
}

export interface IApiOrdersOverview extends IApiSalePerUser {
    closedCount: number;
    closedPrice: number;
    openCount: number;
    openPrice: number;
    canceledCount: number;
    canceledPrice: number;
}


export interface IApiWarehouseAction {
    ProductId: number;
    OrderId: number;

    Date: Date;
    Quantity: number;
    Description: string;
    Operation: string;

    Warehouse: string;
    User: string;
    ProductString: string;
}
