import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShareModule } from './../shared/share.module';

import { SettingsRoutingModule } from './settings.routing';

import { AppSettingsComponent } from './app-settings/app-settings.component';


@NgModule({
  imports: [
    CommonModule,
    ShareModule,
    SettingsRoutingModule
  ],
  declarations: [AppSettingsComponent]
})
export class SettingsModule { }
