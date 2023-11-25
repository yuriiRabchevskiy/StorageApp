import { Order } from '../../storage';

export class ApiProdCountChanges {
    stateRevision: number;
    changes: ApiProdCountChange[];
}

export class ApiProdCountChange {
    productId: number;
    warehouseId: number;
    newCount: number;
    oldCount: number;
}

export class ApiOrdersChanges {
    stateRevision: number;
    changes: ApiOrderChanges[];
}

export class ApiOrderChanges {

  orderId: number;
  changeTime: number;
  order: Order;
}

export class AppState {
    ordersRevision: number;
    productsRevision: number;
}
