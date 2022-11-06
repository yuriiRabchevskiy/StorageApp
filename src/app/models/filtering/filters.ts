import { ViewChild } from '@angular/core';
export abstract class Filter<T> {

    name = 'abstract filter';
    get isActive() {
        return false;
    }

    abstract filter(items: T[]): T[];
}

export class StringFilter<T> extends Filter<T> {

    name = 'string filter';
    public keyword: string;

    getName: (item: T) => string;

    constructor() {
        super();
        this.getName = (item) => (<any>item).Name;
    }

    get isActive(): boolean {
        return this.keyword ? true : false;
    }

    filter(items: T[]) {
        console.log('string filter');
        let key = this.keyword.trim().toUpperCase();
        if (items && items.length > 0 && this.keyword) {
            return items.filter((item) => (this.getName(item) || '').toUpperCase()
                .includes(key));
        };
        return items;
    }
}

export class BoolFilter<T> extends Filter<T> {

    name = 'boolean filter';
    desired: boolean = true;
    getState: (item: T) => boolean = it => true;
    get isActive(): boolean {
        return this._isActive;
    }
    set isActive(value: boolean) {
        this._isActive = value;
    }
    private _isActive = true;

    filter(items: T[]) {
        if (items && items.length > 0) {
            return items.filter(item => {
                return !!this.getState(item) === this.desired;
            });
        };
        return items;
    }
}

export class NumberFilter<T> extends Filter<T> {

    name = 'number filter';
    public number: number;

    getNumber: (item: T) => number | undefined;

    constructor() {
        super();
        this.getNumber = (item) => (<any>item).Name;
    }

    get isActive(): boolean {
        return this.number !== undefined ? true : false;
    }

    filter(items: T[]) {
        console.log('number filter', this.number);
        let key = this.number;
        if (items && items.length > 0 && this.number !== undefined) {
            return items.filter(item => this.getNumber(item) === key);
        }
        return items;
    }
}
