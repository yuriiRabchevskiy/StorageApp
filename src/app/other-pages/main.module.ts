import { ControlsModule } from './../controls/controls.module';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';

/**
 * Top level module for logged user.
 */
import { NgModule } from '@angular/core';
import { MasterpageComponent } from './masterpage';
import * as control from './controls';

const routes: Routes = [{
  path: '', component: MasterpageComponent,
  children: [
    {
      path: 'home', loadChildren: './home/home.module#HomeModule'
    },
    // Lazy loaded modules.
    {
      path: 'manage', loadChildren: '../manage/manage.module#ManageModule'
    },
    {
      path: 'storage', loadChildren: '../storage/storage.module#StorageModule'
    },
    // Unexpected URL handling.
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: '**', redirectTo: 'home', pathMatch: 'full' }
  ]
}];

@NgModule({
  declarations: [MasterpageComponent, control.NavPanelComponent],
  imports: [
    CommonModule,
    ControlsModule,
    RouterModule.forChild(routes)
  ],
  providers: []
})

export class MainModule {}
