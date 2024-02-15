import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../shared/services/auth-guard';
import { ArchiveComponent } from './orders/archive/archive/archive.component';
import { ClientOrdersComponent } from './orders/client-orders/client-orders.component';
import { OrdersComponent } from './orders/orders.component';


const routes: Routes = [
  { path: '', redirectTo: 'app-orders' },
  { path: 'archive', component: ArchiveComponent, canActivate: [AuthGuard] },
  { path: 'app-orders', component: OrdersComponent, canActivate: [AuthGuard] },
  { path: 'mine', component: ClientOrdersComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'app-orders' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrdersRoutingModule { }