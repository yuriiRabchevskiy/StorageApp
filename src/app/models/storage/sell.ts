
export interface ISell {
    idProduct: number;
    fromId: number;
    quantity: number;
    description?: string;
    price: number;
    discountMultiplier: number;
}

export class Sell implements ISell {
    idProduct: number;
    fromId: number;
    quantity: number = 1;
    description?: string;
    price: number;
    discountMultiplier: number;
    public constructor(price: number) {
        this.price = price;
        this.discountMultiplier = 1.0;
    }
}
