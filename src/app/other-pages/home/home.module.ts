import { ControlsModule } from './../../controls/controls.module';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

/**
 * HomeModule used for home screen
 */

import { NgModule } from '@angular/core';
import { HomeComponent } from './home.component';

const routes: Routes = [{ path: '', component: HomeComponent },  { path: '**', component: HomeComponent }];

@NgModule({
  declarations: [HomeComponent],
  imports: [ControlsModule, RouterModule.forChild(routes)],
})

export class HomeModule {
  constructor() { }
}
