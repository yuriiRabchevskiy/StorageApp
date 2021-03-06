import { INDictionary } from '../index';
import { ISell } from './sell';

export interface IProdOrder {
    product: IProduct;
    prodOrder: ISell;
}

export interface IProduct {
    id: number;
    categoryId: number;
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
