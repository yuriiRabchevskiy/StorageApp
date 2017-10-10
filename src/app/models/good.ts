interface IGood {
    name?: string;
    model?: string;
    size?: string;
    total?: number;
    brutto?: number;
    netto?: number;
    priseTotal?: number;
}

export class Good implements IGood {
    // name: string;
    // model: string;
    // size: string;
    // total: number;
    // brutto: number;
    // netto: number;
    // priseTotal: number;
    constructor(public name?: string, public model?: string, public size?: string,
        public total?: number, public brutto?: number, public netto?: number, public priseTotal?: number) { }
}
export class PrimeGood implements IGood {
    constructor(public name?, public model?, public size?, public total?, public brutto?, public netto?, public priseTotal?) {}
}
