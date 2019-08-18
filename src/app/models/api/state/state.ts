import { Order } from '../../storage';

export class ApiProdCountChanges {
    changes: ApiProdCountChange[];
}

export class ApiProdCountChange {
    productId: number;
    warehouseId: number;
    newCount: number;
    oldCount: number;
}

export class ApiOrdersChanges {
    changes: ApiOrderChanges[];
}

export class ApiOrderChanges {

  orderId: number;
  changeTime: number;
  order: Order;
}
