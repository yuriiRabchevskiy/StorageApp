import { OpenOrdersLightComponent } from './open-orders/report-light.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShareModule } from './../shared/share.module';
import { ControlsModule } from '../controls/controls.module';
import { ReportsRoutingModule } from './reports.routing';
import { ReportsSelectionPageComponent } from './reports-page/reports-page.component';
import { OpenOrdersComponent } from './open-orders/report.component';
import { OrdersOverviewComponent } from './orders-overview/report.component';
import { SalesPerUsersComponent } from './sales-per-user/report.component';
import { SalesPerProductComponent } from './sales-per-product/report.component';
import { WarehouseActionsComponent } from './warehouse-actions/report.component';
import { CalendarModule } from 'primeng/calendar';

@NgModule({
  imports: [
    CommonModule,
    ReportsRoutingModule,
    ControlsModule,
    CalendarModule,
    ShareModule
  ],
  declarations: [SalesPerUsersComponent, ReportsSelectionPageComponent, OrdersOverviewComponent,
    WarehouseActionsComponent, OpenOrdersComponent, SalesPerProductComponent, OpenOrdersLightComponent],
  providers: []
})
export class ReportsModule { }
