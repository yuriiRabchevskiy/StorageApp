import { TableModule } from 'primeng/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import 'hammerjs';
import {
  MatTabsModule, MatRadioModule, MatInputModule, MatFormFieldModule,
  MatIconModule, MatSelectModule
} from '@angular/material';
import { CustomMaxDirective } from './directive/customMax.directive';
import { CustomMinDirective } from './directive/customMin.directive';
import { DisableControlDirective } from './directive/disabled.directive';
import { DialogModule } from 'primeng/components/dialog/dialog';
import { InputTextModule } from 'primeng/components/inputtext/inputtext';
import { SpinnerModule } from 'primeng/components/spinner/spinner';
import { ButtonModule } from 'primeng/components/button/button';
import { CheckboxModule } from 'primeng/components/checkbox/checkbox';
import { TooltipModule } from 'primeng/components/tooltip/tooltip';
import { GrowlModule } from 'primeng/components/growl/growl';
import { SharedModule } from 'primeng/components/common/shared';


@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTabsModule,
    MatRadioModule,
    MatIconModule,
    TableModule,
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
