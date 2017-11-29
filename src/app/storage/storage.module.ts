import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShareModule } from './../shared/share.module';

import { StorageRoutingModule } from './storage.routing';
import { StockComponent } from './stock/stock.component';

@NgModule({
  imports: [
    CommonModule,
    ShareModule,
    StorageRoutingModule
  ],
  declarations: [StockComponent]
})
export class StorageModule { }
