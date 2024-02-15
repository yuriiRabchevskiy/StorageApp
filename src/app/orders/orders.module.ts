import { ClientOrdersComponent } from './orders/client-orders/client-orders.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShareModule } from './../shared/share.module';
import { OrdersRoutingModule } from './orders.routing';

import { ControlsModule } from '../controls/controls.module';
import { OrdersComponent } from './orders/orders.component';
import { OrderComponent } from './orders/order/order.component';
import { OrderHistoryComponent } from './controls/order-history/order-history.component';
import { ArchiveComponent } from './orders/archive/archive/archive.component';

@NgModule({
  imports: [
    CommonModule,
    OrdersRoutingModule,
    ControlsModule,
    ShareModule
  ],
  declarations: [OrdersComponent, OrderComponent, OrderHistoryComponent, ArchiveComponent, ClientOrdersComponent],
  providers: []
})
export class OrdersModule { }