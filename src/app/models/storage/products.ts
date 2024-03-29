import { INDictionary } from '../index';
import { ISell } from './sell';

export function buildProductFullName(p: IProduct) {
    const codeStr = p.productCode ? `${p.productCode} - `: '';
    return `${codeStr}${p.size ?? ''} ${p.color ?? ''} ${p.productType ?? ''} - ${p.model ?? ''} ${p.producer ?? ''}`;
}

export enum Availability { NotSet = 0, Present = 1, NotPresent = 2, Expected = 3 }

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
    discountedPrice?: number;
    zeroAvailabilityMarker: Availability;
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
    discountedPrice?: number;
    isNew: boolean = false;
    isActive: boolean = false;
    zeroAvailabilityMarker: Availability = Availability.NotPresent;
    balance = {};

    public constructor() {}

    public static checkIsNew(whatToCheck: Product): boolean {
        return whatToCheck.id === undefined || whatToCheck.id === 0;
    }
}
