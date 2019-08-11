export class ApiProdCountChanges {
    changes: ApiProdCountChange[];
}

export class ApiProdCountChange {
    productId: number;
    warehouseId: number;
    newCount: number;
    oldCount: number;
}
