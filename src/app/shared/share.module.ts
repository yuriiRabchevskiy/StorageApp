import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableModule, DropdownModule, DialogModule, InputTextModule,
         SharedModule, ButtonModule, TabViewModule } from "primeng/primeng";

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    FormsModule,
    HttpModule,
    DataTableModule,
    DropdownModule,
    DialogModule,
    InputTextModule,
    ButtonModule,
    TabViewModule,
    SharedModule,
  ],
  declarations: [],
  providers: []
})
export class ShareModule { }
