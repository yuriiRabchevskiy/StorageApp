import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShareModule } from './../shared/share.module';

import { StorageRoutingModule } from './storage.routing';
import { ControlsModule } from '../controls/controls.module';

import { AppStockComponent } from './app-stock/app-stock.component';
import { ProductComponent } from './app-stock/product/product.component';
import { TransferComponent } from './app-stock/transfer/transfer.component';
import { AdditionComponent } from './app-stock/addition/addition.component';
import { SellComponent } from './app-stock/sell/sell.component';
import { BasketComponent } from './app-stock/basket/basket.component';
import { ProdRemovalComponent } from './app-stock/removal/removal.component';


@NgModule({
  imports: [
    CommonModule,
    ControlsModule,
    ShareModule,
    StorageRoutingModule
  ],
  declarations: [AppStockComponent, ProductComponent, TransferComponent,
    AdditionComponent, SellComponent, BasketComponent, ProdRemovalComponent]
})
export class StorageModule { }
