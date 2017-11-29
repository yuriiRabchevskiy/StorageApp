import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StockComponent } from "./stock/stock.component";

const routes: Routes = [
  { path: '', redirectTo: 'stock' },
  { path: 'stock',  component: StockComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StorageRoutingModule { }
