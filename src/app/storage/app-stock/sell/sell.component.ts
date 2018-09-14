import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ApiService } from '../../../shared/services/api.service';
import { IProduct, IOrder, Order, ISell, Sell } from '../../../models/storage';
import { IWarehouse } from './../../../models/storage/werehouse';
import { ErrorStateMatcher } from '@angular/material';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-sell',
  templateUrl: './sell.component.html',
  styleUrls: ['./sell.component.scss']
})

export class SellComponent implements OnInit {
  productName: string = '';
  count: number;
  expectedCount: number;
  expectedSalePrice: number;
  totalSell: number;
  selectLocation: IWarehouse;
  sCount: FormControl;

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
    if (!val || val < 0) {
      this._sellCount = 0;
    } else if (val > this.product.balance[this.selectedLocation]) {
      this._sellCount = this.product.balance[this.selectedLocation];
    } else {
      this._sellCount = val;
    }
    this.expectedCount = this.count - this._sellCount;
    if (!this.sell) return;
    this.totalSell = this.expectedSalePrice * this._sellCount;
  }

  @Output() onCloseDialog: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() sale: EventEmitter<ISell> = new EventEmitter<ISell>();

  constructor(private apiService: ApiService) {
  }

  ngOnInit() {
    this.sCount =  new FormControl({value: 1, disabled: true},
      [Validators.pattern('^[0-9]+$'), Validators.required]);
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
