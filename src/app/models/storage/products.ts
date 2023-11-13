import { INDictionary } from '../index';
import { ISell } from './sell';

export function buildProductFullName(p: IProduct) {
    const codeStr = p.productCode ? `${p.productCode} - `: '';
    return `${codeStr}${p.size ?? ''} ${p.color ?? ''} ${p.productType ?? ''} - ${p.model ?? ''} ${p.producer ?? ''}`;
}

export interface IProdOrder {
    /**
     * Used to show description only
     */
    product: IProduct;
    /**
     * Used to actually create a sale order
     */
    prodOrder: ISell;
}

export interface IProduct {
    id: number;
    categoryId: number;
    productCode?: string;
    productType?: string;
    model?: string;
    producer?: string;
    color?: string;
    size?: string;
    freeNote?: string;
    recommendedBuyPrice?: number;
    recommendedSalePrice?: number;
    balance?: INDictionary<number>;
    isNew?: boolean;
    isActive?: boolean;
}

export class Product implements IProduct {
    id: number;
    categoryId: number;
    productType: string;
    model: string;
    producer: string;
    color: string;
    size: string;
    freeNote: string;
    recommendedBuyPrice: number;
    recommendedSalePrice: number;
    isNew: boolean = false;
    isActive: boolean = false;
    balance = {};

    public constructor() {}

    public static checkIsNew(whatToCheck: Product): boolean {
        return whatToCheck.id === undefined || whatToCheck.id === 0;
    }
}
