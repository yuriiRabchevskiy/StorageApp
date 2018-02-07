import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShareModule } from './../shared/share.module';
import { OrdersRoutingModule } from './orders.routing';

import { ControlsModule } from '../controls/controls.module';
import { OrdersComponent } from './orders/orders.component';
import { OrderComponent } from './orders/order/order.component';

@NgModule({
  imports: [
    CommonModule,
    OrdersRoutingModule,
    ControlsModule,
    ShareModule
  ],
  declarations: [OrdersComponent, OrderComponent],
  providers: []
})
export class OrdersModule { }