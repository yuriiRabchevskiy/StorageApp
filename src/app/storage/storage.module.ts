import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ShareModule } from './../shared/share.module';
import { ClientOrderEditorComponent } from './app-stock/client-order-editor/client-order-editor.component';

import { ControlsModule } from '../controls/controls.module';
import { StorageRoutingModule } from './storage.routing';

import { AdditionComponent } from './app-stock/addition/addition.component';
import { AppStockComponent } from './app-stock/app-stock.component';
import { BasketComponent } from './app-stock/basket/basket.component';
import { ClientBasketComponent } from './app-stock/client-basket/client-basket.component';
import { ProductComponent } from './app-stock/product/product.component';
import { ProdRemovalComponent } from './app-stock/removal/removal.component';
import { SellComponent } from './app-stock/sell/sell.component';
import { TransferComponent } from './app-stock/transfer/transfer.component';


@NgModule({
  imports: [
    CommonModule,
    ControlsModule,
    ShareModule,
    StorageRoutingModule
  ],
  declarations: [AppStockComponent, ProductComponent, TransferComponent,
    AdditionComponent, SellComponent, BasketComponent,
    ClientBasketComponent, ClientOrderEditorComponent, ProdRemovalComponent]
})
export class StorageModule { }
