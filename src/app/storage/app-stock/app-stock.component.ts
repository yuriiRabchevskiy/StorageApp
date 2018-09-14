import { ISaleOrder } from './../../models/storage/order';
import { IAddition } from './../../models/storage/addition';
import { IWarehouse } from './../../models/storage/werehouse';
import { NumberFilter } from './../../models/filtering/filters';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../shared/services/api.service';
import { IProduct, Product, ITransfer, Sell, ISell } from '../../models/storage';
import { ApiListComponent } from '../../models/component/list-api.component';
import { ICategory } from '../../models/storage/categories';
import { ISaveResult } from './product/product.component';
import { ISaveAddition } from './addition/addition.component';
import { ApiResponse, IApiErrorInfo } from '../../models/api';
import { MessageService } from 'primeng/components/common/messageservice';

@Component({
  selector: 'app-all-stock',
  templateUrl: './app-stock.component.html',
  styleUrls: ['./app-stock.component.scss']
})
export class AppStockComponent extends ApiListComponent<IProduct> {
  selectedItem: IProduct;
  oldItem: IProduct;
  sell: ISell;

  displayDialog: boolean = false;
  transferDialog: boolean = false;
  additionDialog: boolean = false;
  removalDialog: boolean = false;
  sellDialog: boolean = false;
  basketDialog: boolean = false;
  showConfirm: boolean = false;

  sellList: any[] = [];
  categories: any[] = [];
  wereHouses: IWarehouse[] = [];
  isBalance: boolean = false;

  typeFilter: NumberFilter<IProduct> = new NumberFilter<IProduct>();

  tabs: ICategory[] = [];
  _selectedTab: ICategory;

  get selectedTab() {
    return this._selectedTab;
  }
  set selectedTab(value: ICategory) {
    if (this._selectedTab === value) return;
    this._selectedTab = value;
    this.typeFilter.number = value.id > 0 ? value.id : undefined;
    this.filter();
  }

  constructor(private apiService: ApiService, public router: Router, notifi: MessageService) {
    super(notifi);
    this.selectedTab = this.tabs[0];
    this.typeFilter.getNumber = (it) => it.categoryId;
    this.filters.push(this.typeFilter);
    this.loadCategory();
    this.loadWereHouse();
  }

  selectTab(event) {
    this.selectedTab = this.tabs[event.index];
  }

  showDialogToAdd(isMore: boolean = false, isCopy: boolean = false) {
    let newItem: IProduct;
    if (!isCopy) {
      newItem = new Product();
      newItem.productType = 'Продукт';
    } else {
      newItem = this.cloneModel(this.selectedItem);
      newItem.id = undefined;
      newItem.productType = newItem.productType + ' копія';
    }
    newItem.isNew = true;
    newItem.isActive = true;
    this.selectedItem = newItem;
    this.add(this.selectedItem);
    this.filteredData = this.filteredData.slice();
    this.displayDialog = true;
  }

  showDialogToEdit(val: IProduct) {
    this.selectedItem = val;
    this.displayDialog = true;
  }

  delete(val: IProduct) {
    let deleteProd = val;
    this.work.showSpinner = true;
    this.apiService.deleteProduct(deleteProd.id).subscribe(
      res => {
        this.work.showSpinner = false;
        if (res.success) {
          this.remove(deleteProd);
          return this.showSuccessMessage('Товар видалено');
        }
        this.showApiErrorMessage('Помилка при видаленні товару!', res.errors);
      },
      err => {
        this.work.showSpinner = false;
        this.showWebErrorMessage('Не вдалось видалити товар', err);
      }
    );
    if (this.filteredData.length > 0) {
      this.selectedItem = this.filteredData[0];
    }
    this.displayDialog = false;
  }

  confirmDelete(val: boolean) {
    if (!val) {
      this.showConfirm = false;
      return;
    }
    this.delete(this.selectedItem);
    this.showConfirm = false;
  }

  confirmation() {
    this.showConfirm = true;
  }

  save(val: ISaveResult) {
    let product = val.product;
    if ((<any>product).isNew) {
      this.isBalance = false;
      this.apiService.addProduct(product).subscribe(
        res => {
          if (res.success) {
            this.oldItem = this.cloneModel(product);
            (<any>product).isNew = false;
            product.id = res.item;
            return this.showSuccessMessage('Товар додано');
          }
          this.showApiErrorMessage('Помилка при додаванні товару!', res.errors);
        },
        err => this.showWebErrorMessage('Не вдалось створити новий товар', err)

      );
    } else {
      this.apiService.editProduct(product).subscribe(
        res => {
          if (res.success) {
            return this.showSuccessMessage('Зміни збережено');
          }
          this.showApiErrorMessage('Помилка при редагуванні товару!', res.errors);
        },
        err => this.showWebErrorMessage('Не вдалось відредагувати товар', err)
      );
    }
    this.selectedItem = val.product;
    this.displayDialog = val.more;
    if (val.more) this.showDialogToAdd(val.more, val.copy);
  }

  duplicate() {
    this.showDialogToAdd(false, true);
  }

  doTransfer(val: ITransfer) {
    let item = val;
    let balance = this.selectedItem.balance;
    balance[item.fromId] = balance[item.fromId] - item.quantity;
    balance[item.toId] = (balance[item.toId] || 0) + item.quantity;
    this.updateBalanceFields(this.selectedItem, balance);
    this.apiService.doTransfer(this.selectedItem.id, item).subscribe(
      res => {
        if (res.success) {
          this.filter();
          return this.showSuccessMessage('Трансфер успішно виконано');
        }
        this.showApiErrorMessage('Помилка при поповнені складу!', res.errors);
      },
      err => {
        this.showWebErrorMessage('Не вдалось здійснити трансфер', err);
      }
    );
    this.transferDialog = false;
  }

  removeProducts(val: ISaveAddition) {
    let item = val.item;
    let balance = this.selectedItem.balance;
    balance[item.fromId] = (balance[item.fromId] || 0) - item.quantity;
    this.updateBalanceFields(this.selectedItem, balance);
    this.apiService.removeProductsFromWarehouse(this.selectedItem.id, item).subscribe(
      res => {
        if (res.success) {
          return this.showSuccessMessage('Надлишки успішно видалені');
        }
        this.showApiErrorMessage('Помилка при видалені товару зі складу!', res.errors);
      },
      err => {
        this.showWebErrorMessage('Не вдалось видалити надлишки', err);
      }
    );
    this.showRemovalDialog(val.more);
  }

  saveAddition(val: ISaveAddition) {
    let item = val.item;
    let balance = this.selectedItem.balance;
    balance[item.fromId] = (balance[item.fromId] || 0) + item.quantity;
    this.updateBalanceFields(this.selectedItem, balance);
    this.apiService.addProductsToWarehouse(this.selectedItem.id, item).subscribe(
      res => {
        if (res.success) {
          return this.showSuccessMessage('Склад поповнено');
        }
        this.showApiErrorMessage('Помилка при поповнені складу!', res.errors);

      },
      err => {
        this.showWebErrorMessage('Не вдалося поповнити склад', err);
      }
    );
    this.showAdditionDialog(val.more);
  }

  sale(val: ISell) {
    let item = val;
    let balance = this.selectedItem.balance;
    balance[val.fromId] = balance[val.fromId] - item.quantity;
    this.updateBalanceFields(this.selectedItem, balance);
    let sellItem = {
      product: this.selectedItem,
      prodOrder: item
    };
    this.sellList.push(sellItem);
    this.showSuccessMessage('Продукт додано до кошика');
    this.sellDialog = false;
  }



  turnFromBasket(event) {
    let item = event;
    this.selectedItem = this.data.find(it => it.id === event.product.id);
    let balance = this.selectedItem.balance;
    balance[event.prodOrder.fromId] = balance[event.prodOrder.fromId] + item.prodOrder.quantity;
    this.updateBalanceFields(this.selectedItem, balance);
  }

  onRowClick(event) {
    this.findTotalBalance(event);
    if (this.selectedItem !== event.data) return;
    if (!this.isBalance || !this.selectedItem.id) return;
    this.showSellDialog();
  }

  findTotalBalance(val) {
    let data;
    if (!val.data) {
      data = val.balance;
    } else {
      data = val.data.balance;
    }
    let counts = [];
    for (let key in data) {
      counts.push(data[key]);
    }
    let count = counts.reduce((a, b) => {
      return a + b;
    }, 0);
    if (count > 0) {
      this.isBalance = true;
    } else {
      this.isBalance = false;
    }
  }

  updateBalanceFields(product: IProduct, balance) {
    Object.keys(balance).map(key => product['wh_' + key] = balance[key]);
  }

  loadCategory() {
    this.apiService.getCategories().subscribe(
      res => {
        if (res.success) {
          this.tabs = res.items;
          this.categories = res.items.map(it => it);
          this.tabs.unshift({ name: 'Усі', id: 0, isActive: true });
        }
      },
      err => console.log(err));
  }

  loadWereHouse() {
    this.apiService.getWarehouses().subscribe(
      res => {
        if (res.success) {
          this.wereHouses = res.items;
          if (this.canView) return;
          let localToHidden = this.wereHouses.find(it => it.id === 2);
          let indexToRemove = this.wereHouses.indexOf(localToHidden);
          this.wereHouses.splice(indexToRemove, 1);
        }
      },
      err => console.log(err));
  }

  doGetData() {
    return this.apiService.getProducts();
  }

  onDataReceived(res: ApiResponse<IProduct>) {
    if (res.success) {
      res.items.map(it => this.updateBalanceFields(it, it.balance));
    }
    super.onDataReceived(res);
    this.findTotalBalance(this.selectedItem);
  }

  public closeDialog(event) {
    this.displayDialog = event;
    if (this.filteredData.length < 1) return;
    if (!this.selectedItem.id) {
      this.remove(this.selectedItem);
      this.selectedItem = this.filteredData[0];
    }
  }

  showSellDialog() {
    this.sellDialog = true;
    let newSell = new Sell(this.selectedItem.recommendedSalePrice);
    newSell.idProduct = this.selectedItem.id;
    this.sell = newSell;
  }

  closeSellDialog(event) {
    this.sellDialog = event;
  }

  showAdditionDialog(val: boolean) {
    this.additionDialog = val;
  }

  closeAdditionDialog(event) {
    this.additionDialog = event;
  }

  showRemovalDialog(val: boolean) {
    this.removalDialog = val;
  }

  closeRemovalDialog(event) {
    this.removalDialog = event;
  }

  showTransferDialog() {
    this.transferDialog = true;
  }

  closeTransferDialog(event) {
    this.transferDialog = event;
  }

  showBasketDialog() {
    this.basketDialog = true;
  }

  closeBasketDialog(event) {
    this.basketDialog = false;
    if (event) {
      this.sellList = [];
    }
  }

  disabledRow(val: IProduct) {
    const keys = Object.keys(val.balance);
    const sum = keys.map(it => <number>val.balance[it]).reduce((p, c) => p + c, 0);
    return !sum ? 'disabled-row' : '';
  }



}
