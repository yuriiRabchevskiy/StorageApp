import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShareModule } from './../shared/share.module';
import { ManageRoutingModule } from './manage.routing';

import { UsersComponent } from './users/users.component';
import { UserComponent } from './users/user/user.component';
import { ControlsModule } from '../controls/controls.module';
import { UserEditorComponent } from './users/user-editor/user-editor.component';

@NgModule({
  imports: [
    CommonModule,
    ManageRoutingModule,
    ControlsModule,
    ShareModule
  ],
  declarations: [UsersComponent, UserComponent, UserEditorComponent],
  providers: []
})
export class ManageModule { }
