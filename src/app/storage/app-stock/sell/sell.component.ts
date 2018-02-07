import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ApiService } from '../../../shared/services/api.service';
import { IProduct, IOrder, Order, ISell, Sell } from '../../../models/storage';
import { IWarehouse } from './../../../models/storage/werehouse';
import { ErrorStateMatcher } from '@angular/material';
import { FormControl } from '@angular/forms';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.value < 1 && (control.dirty || control.touched));
  }
}

@Component({
  selector: 'app-sell',
  templateUrl: './sell.component.html',
  styleUrls: ['./sell.component.scss']
})

export class SellComponent {
  productName: string = '';
  count: number;
  expectedCount: number;
  expectedSalePrice: number;
  totalSell: number;
  selectLocation: IWarehouse;

  validate = new MyErrorStateMatcher();

  private _product: IProduct;
  get product() {
    return this._product;
  }
  @Input() set product(value) {
    if (!value) return;
    this._product = value;
    this.productName = value.productType + ' ' + value.model + ' ' + value.producer + ' ' + value.size;
    this.expectedSalePrice = this.product.recommendedSalePrice;
    this.count = this._product.balance[1] || 0;
  }

  _locations: IWarehouse[] = [];
  @Input() set locations(val: IWarehouse[]) {
    if (!val) return;
    this._locations = val;
    this.selectedLocation = val[0] ? val[0].id : undefined;
    if (!this.selectedLocation) return;
    this.selectLocation = this._locations.find(it => it.id === this.selectedLocation);
  }
  get locations() {
    return this._locations;
  }

  _selectedLocation: number;
  get selectedLocation() {
    return this._selectedLocation;
  }
  set selectedLocation(value) {
    if (!value) return;
    this._selectedLocation = value;
    if (!this.product) return;
    this.count = this.product.balance[value] || 0;
    this.sellCount = Math.min(1, this.count);
  }

  _sell: ISell;
  get sell() {
    return this._sell;
  }

  @Input() set sell(val: ISell) {
    this._sell = val;
    if (this.product.balance[this.selectedLocation] > 0) {
      this.sellCount = val.quantity;
    } else {
      this.sellCount = 0;
    }
  }

  _sellCount: number;
  get sellCount() {
    return this._sellCount;
  }

  set sellCount(val) {
    this._sellCount = val;
    if (val < 0) return;
    this.expectedCount = this.count - val;
    if (!this.sell) return;
    this.totalSell = this.expectedSalePrice * val;
  }

  @Output() onCloseDialog: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() sale: EventEmitter<ISell> = new EventEmitter<ISell>();

  constructor(private apiService: ApiService) {
  }

  save() {
    this.sell.fromId = this.selectedLocation;
    this.sell.quantity = this.sellCount;
    this.sale.emit(this.sell);
  }

  closeDialog() {
    this.onCloseDialog.emit(false);
  }

}
