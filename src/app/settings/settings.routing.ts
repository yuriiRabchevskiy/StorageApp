import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../shared/services/auth-guard';

import { AppSettingsComponent } from './app-settings/app-settings.component';

const routes: Routes = [
  { path: '', redirectTo: 'app-settings' },
  { path: 'app-settings',  component: AppSettingsComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'app-settings' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
