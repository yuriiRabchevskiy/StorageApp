import { FormControl, Validators } from '@angular/forms';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ApiService } from '../../../shared/services/api.service';
import { IProduct } from '../../../models/storage';
import { IWarehouse } from './../../../models/storage/werehouse';
import { IAddition, AdditionItem } from '../../../models/storage/addition';

export interface ISaveAddition {
  item: IAddition;
  more: boolean;
}

@Component({
  selector: 'app-addition',
  templateUrl: './addition.component.html',
  styleUrls: ['./addition.component.scss']
})

export class AdditionComponent {
  @Input() addNext: boolean = false;
  addCountError: boolean;
  count: number;
  expectedCount: number;
  selectLocation: IWarehouse;
  countInp: FormControl;
  private _product: IProduct;
  get product() {
    return this._product;
  }
  @Input() set product(value) {
    if (!value) return;
    this._product = value;
    this.count = this._product.balance[1] || 0;
    this.addCount = Math.min(1, this.count);
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
    this.addCount = Math.min(1, this.count);
  }

  _addCount: number;
  get addCount() {
    return this._addCount;
  }

  set addCount(val) {
    if (val <= 0) {
      this._addCount = 0;
    } else {
      this._addCount = val;
    }
    this.expectedCount = this.count + this._addCount;
  }

  @Output() onCloseDialog: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() addition: EventEmitter<ISaveAddition> = new EventEmitter<ISaveAddition>();

  constructor(private apiService: ApiService) {
  }

  ngOnInit() {
    this.countInp =  new FormControl({value: 1},
      [Validators.pattern('^[0-9]+$'), Validators.required]);
  }

  save() {
    let newCount = new AdditionItem();
    newCount.fromId = this.selectedLocation;
    newCount.quantity = this.addCount;
    this.addition.emit({item: newCount, more: this.addNext });
  }

  closeDialog() {
    this.onCloseDialog.emit(false);
  }

  addMore(event) {
    this.addNext = event;
  }

}
