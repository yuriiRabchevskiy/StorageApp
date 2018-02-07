import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import 'hammerjs';
import { MatTabsModule, MatRadioModule, MatInputModule, MatFormFieldModule,
    MatIconModule, MatSelectModule } from '@angular/material';
import { EqualValidatorDirective } from './directive/index';
import { DataTableModule, DialogModule, InputTextModule,
  SpinnerModule, ButtonModule, CheckboxModule, TooltipModule,
  GrowlModule, SharedModule } from 'primeng/primeng';


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
  ],
  declarations: [EqualValidatorDirective],
  providers: []
})
export class ShareModule { }
