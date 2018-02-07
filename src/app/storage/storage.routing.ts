import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../shared/services/auth-guard';

import { AppStockComponent } from './app-stock/app-stock.component';

const routes: Routes = [
  { path: '', redirectTo: 'app-stock' },
  { path: 'app-stock',  component: AppStockComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'app-stock' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StorageRoutingModule { }
