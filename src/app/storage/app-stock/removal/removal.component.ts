import { FormControl, Validators } from '@angular/forms';
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ApiService } from '../../../shared/services/api.service';
import { IProduct } from '../../../models/storage';
import { IWarehouse } from './../../../models/storage/werehouse';
import { IAddition, AdditionItem } from '../../../models/storage/addition';

export interface ISaveAddition {
  item: IAddition;
  more: boolean;
}

@Component({
  selector: 'app-prod-removal',
  templateUrl: './removal.component.html',
  styleUrls: ['./removal.component.scss']
})

export class ProdRemovalComponent implements OnInit {
  @Input() removeNext: boolean = false;
  @Output() onCloseDialog: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() removeRequested: EventEmitter<ISaveAddition> = new EventEmitter<ISaveAddition>();

  count: number;
  expectedCount: number;
  selectLocation: IWarehouse;
  description: string;
  minCount = 1;
  countInp: FormControl;

  private _product: IProduct;
  get product() {
    return this._product;
  }
  @Input() set product(value) {
    if (!value) return;
    this._product = value;
    this.count = this._product.balance[1] || 0;
    this.minCount = Math.min(1, this.count);
    this.removeCount = this.minCount;
    if (!this.locations.length) return;
    this.selectedLocation = this.locations[0].id;
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
    this.removeCount = Math.min(0, this.count);
  }

  _removeCount: number;
  get removeCount() {
    return this._removeCount;
  }

  set removeCount(val) {
    if (!val || val < 0) {
      this._removeCount = 0;
    } else if (val > this.product.balance[this.selectedLocation]) {
      this._removeCount = this.product.balance[this.selectedLocation];
    } else {
      this._removeCount = val;
    }
    this.expectedCount = this.count - this._removeCount;
  }

  constructor(private apiService: ApiService) {
  }

  ngOnInit() {
    this.countInp =  new FormControl({value: 1, disabled: true},
      [Validators.pattern('^[0-9]+$'), Validators.required]);
  }

  save() {
    let newCount = new AdditionItem();
    newCount.fromId = this.selectedLocation;
    newCount.quantity = this.removeCount;
    newCount.description = this.description;
    this.removeRequested.emit({item: newCount, more: this.removeNext });
  }

  closeDialog() {
    this.onCloseDialog.emit(false);
  }

  removeMore(event) {
    this.removeNext = event;
  }

}
