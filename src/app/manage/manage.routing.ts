import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UsersComponent } from './users/users.component';

export const routes: Routes = [
  { path: '', redirectTo: 'users' },
  { path: 'users', component: UsersComponent }
];

@NgModule ({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class ManageRoutingModule {

}