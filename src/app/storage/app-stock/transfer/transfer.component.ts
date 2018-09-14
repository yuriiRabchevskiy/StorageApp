import { FormControl, Validators } from '@angular/forms';
import { IWarehouse } from './../../../models/storage/werehouse';
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ApiService } from '../../../shared/services/api.service';
import { SelectItem } from 'primeng/primeng';
import { IProduct } from '../../../models/storage';
import { ITransfer, TransferItem } from '../../../models/storage';
import * as moment from 'moment-mini';

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.component.html',
  styleUrls: ['./transfer.component.scss']
})

export class TransferComponent implements OnInit {
  locationFrom: IWarehouse;
  locationTo: IWarehouse;
  fromCount: number;
  toCount: number;
  expectedFromCount: number;
  expectedToCount: number;
  date: Date;
  dateNow: string;
  disabled: boolean = true;
  trCount: FormControl;
  private _product: IProduct;
  get product() {
    return this._product;
  }
  @Input() set product(value) {
    if (!value) return;
    this._product = value;
    this.fromCount = this._product.balance[1] || 0;
    this.toCount = this._product.balance[2] || 0;
    this.transferCount = Math.min(1, this.fromCount);
  }

  locationHouses: SelectItem[] = [];
  _locations: IWarehouse[] = [];
  @Input() set locations(val: IWarehouse[]) {
    if (!val) return;
    this._locations = val;
    this.locationHouses = val.map(it => ({ label: it.name, value: it.id }));
    this.selectedTo = val[1] ? val[1].id : undefined;
    this.selectedFrom = val[0] ? val[0].id : undefined;
  }
  get locations() {
    return this._locations;
  }

  _selectedFrom: number;
  get selectedFrom() {
    return this._selectedFrom;
  }
  set selectedFrom(value) {
    if (!value) return;
    this._selectedFrom = value;
    this.locationFrom = this.locations[value - 1];

    if (!this.product) return;
    this.fromCount = this.product.balance[value] || 0;

    this.transferCount = Math.min(1, this.fromCount);
  }

  _selectedTo: number;
  get selectedTo() {
    return this._selectedTo;
  }
  set selectedTo(value) {
    if (!value) return;
    this._selectedTo = value;
    if (!this.product) return;
    this.toCount = this.product.balance[value] || 0;
    this.locationTo = this.locations[value - 1];
  }

  _transferCount: number = 0;
  get transferCount() {
    return this._transferCount;
  }

  set transferCount(val) {
    if (!val || val < 0) {
      this._transferCount = 0;
    } else if (val > this.fromCount) {
      this._transferCount = this.fromCount;
    } else {
      this._transferCount = val;
    }
    this.expectedFromCount = this.fromCount - this._transferCount;
    this.expectedToCount = this.toCount + this._transferCount;
  }

  @Output() onCloseDialog: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() transfer: EventEmitter<ITransfer> = new EventEmitter<ITransfer>();

  constructor(private apiService: ApiService) {
    let date = Date.now();
    this.dateNow = moment(new Date(Number(date))).format('DD/MM/YYYY');
  }

  ngOnInit() {
    this.trCount =  new FormControl({value: 1, disabled: true},
      [Validators.pattern('^[0-9]+$'), Validators.required]);
  }

  updateSelection(value) {
    if (!value) return;
    this.selectedTo = this.locations.find(it => it.id !== value).id;
    this.selectedFrom = value;
  }

  save() {
    let newTransfer = new TransferItem();
    newTransfer.fromId = this.selectedFrom;
    newTransfer.toId = this.selectedTo;
    newTransfer.quantity = this.transferCount;
    newTransfer.description = 'test ' + this.dateNow;
    this.transfer.emit(newTransfer);
  }

  closeDialog() {
    this.onCloseDialog.emit(false);
  }

}
