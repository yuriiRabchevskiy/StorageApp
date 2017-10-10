import { UsersService } from './shared/services/users.service';
import { StockService, } from './shared/services/stock.service';
import { ApiService } from "./shared/services/api.service";

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AppRoutingModule } from './app.routing';
import { AppComponent } from './app.component';

import { ShareModule } from './shared/share.module';
import { DataTableModule, DialogModule, InputTextModule, DropdownModule, SharedModule } from 'primeng/primeng';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpModule,
    AppRoutingModule,
    ShareModule,
    DataTableModule,
    DropdownModule,
    DialogModule,
    InputTextModule, SharedModule
  ],
  providers: [ApiService, StockService, UsersService],
  bootstrap: [AppComponent]
})
export class AppModule { }
