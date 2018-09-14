import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import 'hammerjs';
import { MatTabsModule, MatRadioModule, MatInputModule, MatFormFieldModule,
    MatIconModule, MatSelectModule } from '@angular/material';
import { DataTableModule, DialogModule, InputTextModule,
  SpinnerModule, ButtonModule, CheckboxModule, TooltipModule,
  GrowlModule, SharedModule } from 'primeng/primeng';
import { CustomMaxDirective } from './directive/customMax.directive';
import { CustomMinDirective } from './directive/customMin.directive';
import { DisableControlDirective } from './directive/disabled.directive';


@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTabsModule,
    MatRadioModule,
    MatIconModule,
    DataTableModule,
    DialogModule,
    InputTextModule,
    SpinnerModule,
    ButtonModule,
    CheckboxModule,
    TooltipModule,
    GrowlModule,
    SharedModule,
    CustomMaxDirective, CustomMinDirective, DisableControlDirective
  ],
  declarations: [CustomMaxDirective, CustomMinDirective, DisableControlDirective],
  providers: []
})
export class ShareModule { }
