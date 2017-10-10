import { ManageRoutingModule } from './manage.routing';
import { ShareModule } from './../shared/share.module';
import { ControlsModule } from './../controls/controls.module';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';


import { UsersComponent } from './users/users.component';


@NgModule({
  declarations: [UsersComponent],
  imports: [ManageRoutingModule, ControlsModule, ShareModule],
  providers: [],
  exports: [ControlsModule],
})


export class ManageModule {
  constructor() {
  }
}
