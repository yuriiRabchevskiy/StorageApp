import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShareModule } from './../shared/share.module';
import { ManageRoutingModule } from './manage.routing';

import { UsersComponent } from './users/users.component';
import { UserComponent } from "./user/user.component";

@NgModule({
  imports: [
    CommonModule,
    ManageRoutingModule,
    ShareModule
  ],
  declarations: [UsersComponent, UserComponent],
  providers: []
})
export class ManageModule { }
