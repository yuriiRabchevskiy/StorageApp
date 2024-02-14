import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShareModule } from '../shared/share.module';
import {
  SpinnerComponent, ConfirmComponent, IconButtonComponent,
  OrderEditorComponent, ButtonGroupComponent
} from './index';
import { ReturnComponent } from './return/return.component';
import { ColumnsPickerComponent } from './columns-picker/columns-picker.component';
import { AllowNumbersOnlyDirective } from './order-editor/number-directive';

@NgModule({
  declarations: [SpinnerComponent, ConfirmComponent, IconButtonComponent, OrderEditorComponent,
    ButtonGroupComponent, ReturnComponent, ColumnsPickerComponent, AllowNumbersOnlyDirective],
  imports: [CommonModule, ShareModule],
  entryComponents: [],
  exports: [SpinnerComponent, ConfirmComponent, IconButtonComponent, OrderEditorComponent,
    ButtonGroupComponent, ReturnComponent, ColumnsPickerComponent]
})

export class ControlsModule {
  constructor() { }
}
