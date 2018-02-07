import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShareModule } from '../shared/share.module';
import { SpinnerComponent, ConfirmComponent, IconButtonComponent,
         OrderEditorComponent, ButtonGroupComponent } from './index';
import { UserEditorComponent } from './user-editor/user-editor.component';
import { ReturnComponent } from './return/return.component';

@NgModule({
  declarations: [SpinnerComponent, ConfirmComponent, IconButtonComponent, OrderEditorComponent,
                 ButtonGroupComponent, UserEditorComponent, ReturnComponent],

  imports: [CommonModule, ShareModule],
  entryComponents: [],
  exports: [SpinnerComponent, ConfirmComponent, IconButtonComponent, OrderEditorComponent,
            ButtonGroupComponent, UserEditorComponent, ReturnComponent]
})

export class ControlsModule {
  constructor() { }
}