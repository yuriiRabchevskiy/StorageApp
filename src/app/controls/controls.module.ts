import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShareModule } from '../shared/share.module';
import {
  SpinnerComponent, ConfirmComponent, IconButtonComponent,
  OrderEditorComponent, ButtonGroupComponent
} from './index';
import { UserEditorComponent } from './user-editor/user-editor.component';
import { ReturnComponent } from './return/return.component';
import { ColumnsPickerComponent } from './columns-picker/columns-picker.component';
import { AllowNumbersOnlyDirective } from './order-editor/number-directive';

@NgModule({
  declarations: [SpinnerComponent, ConfirmComponent, IconButtonComponent, OrderEditorComponent,
    ButtonGroupComponent, UserEditorComponent, ReturnComponent, ColumnsPickerComponent, AllowNumbersOnlyDirective],
  imports: [CommonModule, ShareModule],
  entryComponents: [],
  exports: [SpinnerComponent, ConfirmComponent, IconButtonComponent, OrderEditorComponent,
    ButtonGroupComponent, UserEditorComponent, ReturnComponent, ColumnsPickerComponent]
})

export class ControlsModule {
  constructor() { }
}
