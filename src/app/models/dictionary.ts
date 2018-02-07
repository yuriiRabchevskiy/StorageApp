export interface IDictionary<T> {
    [report: string]: T;
}

export interface INDictionary<T> {
    [report: number]: T;
}

export class Dictionary<T> implements IDictionary<T> {

    [report: string]: T;
}

export class NDictionary<T> implements INDictionary<T> {
    [report: number]: T;
}
