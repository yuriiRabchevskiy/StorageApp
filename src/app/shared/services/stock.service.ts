import { Good } from '../../models/good';

export class StockService {
    private data: Good[] = [
        {
            name: 'Paket',
            model: 'Black',
            size: 'big',
            total: 5,
            brutto: 10.01,
            netto: 12.01,
            priseTotal: 2
        },
        {
            name: 'kylyok',
            model: 'red',
            size: 'small',
            total: 2,
            brutto: 2.01,
            netto: 3.01,
            priseTotal: 1
        }, {
            name: 'Paket',
            model: 'Black',
            size: 'big',
            total: 5,
            brutto: 10.01,
            netto: 12.01,
            priseTotal: 2
        }, {
            name: 'Paket',
            model: 'Black',
            size: 'big',
            total: 5,
            brutto: 10.01,
            netto: 12.01,
            priseTotal: 2
        },
    ];
    getData(): Good[] {
        return this.data;
    }

    addData(name: string, model: string, size: string, total: number, brutto: number, netto: number, priseTotal: number) {
        this.data.push(new Good(name, model, size, total, brutto, netto, priseTotal));
    }
}
