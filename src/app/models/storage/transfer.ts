export interface ITransfer {
    fromId: number;
    toId: number;
    quantity: number;
    description?: string;
}

export class TransferItem implements ITransfer {
    fromId: number;
    toId: number;
    quantity: number;
    description?: string;

    public constructor() {}
}
