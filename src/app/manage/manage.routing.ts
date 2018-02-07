import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../shared/services/auth-guard';


import { UsersComponent } from './users/users.component';


const routes: Routes = [
  { path: '', redirectTo: 'app-users' },
  { path: 'app-users',  component: UsersComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'app-users' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageRoutingModule { }
