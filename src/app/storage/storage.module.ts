import { StockComponent } from './stock/stock.component';
import { StorageRoutingModule } from './storage.routing';
import { ShareModule } from './../shared/share.module';
import { ControlsModule } from './../controls/controls.module';
import { NgModule } from '@angular/core';

@NgModule({
  declarations: [StockComponent],
  imports: [StorageRoutingModule, ControlsModule, ShareModule],
  providers: [],
  exports: [ControlsModule],
})

export class StorageModule {
  constructor() {
  }
}
