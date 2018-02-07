export interface IAddition {
    fromId: number;
    quantity: number;
    description?: string;
    price?: number;
}

export class AdditionItem implements IAddition {
    fromId: number;
    quantity: number;
    description?: string;
    price?: number;

    public constructor() {}
}
