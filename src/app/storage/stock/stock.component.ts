import { StockService } from './../../shared/services/stock.service';

import { Component, OnInit } from '@angular/core';
import { SharedModule } from 'primeng/primeng';
import { Good, PrimeGood } from "../../models/good";

@Component({
  selector: 'stock',
  templateUrl: './stock.html',
  styleUrls: ['./stock.scss']
})
export class StockComponent implements OnInit {
  loading: boolean;
  data: Good[] = [];
  cols: any[];
  displayDialog: boolean;

  good: Good = new PrimeGood();

  selectedItem: Good;

  newGood: boolean;

  constructor(private dataService: StockService) { }

  ngOnInit() {
    this.data = this.dataService.getData();

    this.cols = [
      { field: 'name', header: 'name' },
      { field: 'model', header: 'model' },
      { field: 'size', header: 'size' },
      { field: 'total', header: 'total' },
      { field: 'brutto', header: 'brutto' },
      { field: 'netto', header: 'netto' },
      { field: 'priseTotal', header: 'priseTotal' }
    ];
  }

  showDialogToAdd() {
    this.newGood = true;
    this.good = new PrimeGood();
    this.displayDialog = true;
  }

  save() {
    let items = [...this.data];
    if (this.newGood) {
      items.push(this.good);
    } else {
      items[this.findSelectedCarIndex()] = this.good;
    }

    this.data = items;
    this.good = null;
    this.displayDialog = false;
  }

  delete() {
    let index = this.findSelectedCarIndex();
    this.data = this.data.filter((val, i) => i !== index);
    this.good = null;
    this.displayDialog = false;
  }

  onRowSelect(event) {
    this.newGood = false;
    this.good = this.cloneCar(event.data);
    this.displayDialog = true;
  }

  cloneCar(c: Good): Good {
    let item = new PrimeGood();
    for (let prop in c) {
      item[prop] = c[prop];
    }
    return item;
  }

  findSelectedCarIndex(): number {
    return this.data.indexOf(this.selectedItem);
  }

  addItem(name: string, model: string, size: string, total: number, brutto: number, netto: number, priseTotal: number) {
    this.dataService.addData(name, model, size, total, brutto, netto, priseTotal);
  }
}
