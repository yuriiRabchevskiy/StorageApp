import { MessageService } from 'primeng/api';
import { UserService } from './../../../shared/services/user.service';
import { ICategory } from './../../../models/storage/categories';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IProduct } from '../../../models/storage';
import { SecuredComponent } from '../../../models/component/base-api.component';

export interface ISaveResult {
  product: IProduct;
  more: boolean;
  copy: boolean;
}

export interface IAvailabilityStatus {
  id: number;
  name: string;
}


@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent extends SecuredComponent {
  @Input() addNext: boolean = false;
  @Input() addCopy: boolean = false;
  header: string = '';

  private _product: IProduct;
  get product() {
    return this._product;
  }
  @Input() set product(value) {
    this._product = value;
    this.createHeader(value);
    if (!this.categories || !value) return; // no yet loaded
    this.selectedCategory = value.categoryId;
  }

  availabilities: IAvailabilityStatus[] = [
    {
      id: 2,
      name: "Немає в наявності"
    },
    {
      id: 3,
      name: "Очікується"
    }];


  _categories: ICategory[] = [];
  @Input() set categories(val: ICategory[]) {
    this._categories = val;
    if (this._product) {
      this.selectedCategory = this.product.categoryId;
    } else {
      this.selectedCategory = this._categories[0] ? this._categories[0].id : undefined;
    }
  }
  get categories() {
    return this._categories;
  }

  _selectedCategory: number;
  get selectedCategory() {
    return this._selectedCategory;
  }
  @Input() set selectedCategory(value) {
    this._selectedCategory = value;
    if (!this.product) return;
    this.product.categoryId = value;
  }

  @Output() onCloseDialog: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output() saveProduct: EventEmitter<ISaveResult> = new EventEmitter<ISaveResult>();

  constructor(userService: UserService, notify: MessageService) {
    super(userService, notify);
  }
  createHeader(val) {
    if (!val.id && !val.categoryId) {
      this.header = 'Новий Продукт';
    } else if (!val.id) {
      this.header = 'Копіювати Продукт';
    } else {
      this.header = 'Редагувати Продукт';
    }
  }

  save(val: IProduct) {
    if (!this.product.categoryId) {
      const id = this.selectedCategory || (this.categories[0] ? this.categories[0].id : 0);
      this.product.categoryId = id;
    }
    this.saveProduct.emit({ product: val, more: this.addNext, copy: this.addCopy });
  }

  closeDialog() {
    this.onCloseDialog.emit(false);
  }

  addMore(event: boolean) {
    this.addNext = event;
  }

  addMoreCopy(event: boolean) {
    this.addCopy = event;
  }

}
