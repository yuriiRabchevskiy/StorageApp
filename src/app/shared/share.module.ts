import { TableModule } from 'primeng/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import 'hammerjs';
import { CustomMaxDirective } from './directive/customMax.directive';
import { CustomMinDirective } from './directive/customMin.directive';
import { DisableControlDirective } from './directive/disabled.directive';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SpinnerModule } from 'primeng/spinner';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { SharedModule } from 'primeng/api';

import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatRadioModule } from '@angular/material/radio';
import { MatInputModule } from '@angular/material/input';


@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    DialogModule,
    InputTextModule,
    SpinnerModule,
    ButtonModule,
    CheckboxModule,
    TooltipModule,
    ToastModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTabsModule,
    MatInputModule,
    MatRadioModule,
    SharedModule,
    CustomMaxDirective, CustomMinDirective, DisableControlDirective
  ],
  declarations: [CustomMaxDirective, CustomMinDirective, DisableControlDirective],
  providers: []
})
export class ShareModule {

}
