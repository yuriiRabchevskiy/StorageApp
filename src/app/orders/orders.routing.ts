import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../shared/services/auth-guard';


import { OrdersComponent } from './orders/orders.component';


const routes: Routes = [
  { path: '', redirectTo: 'app-orders' },
  { path: 'app-orders',  component: OrdersComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'app-orders' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrdersRoutingModule { }