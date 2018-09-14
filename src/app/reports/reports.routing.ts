import { ReportsSelectionPageComponent } from './reports-page/reports-page.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../shared/services/auth-guard';


const routes: Routes = [
  { path: '', component: ReportsSelectionPageComponent, canActivate: [AuthGuard]  },
  { path: 'report/:item', component: ReportsSelectionPageComponent, canActivate: [AuthGuard] },
  { path: 'sales-per-user', component: ReportsSelectionPageComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'reports' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }
