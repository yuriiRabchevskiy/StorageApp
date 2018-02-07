import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule, BaseRequestOptions } from '@angular/http';
import 'rxjs/Rx';
import 'hammerjs';

import { routing } from './app.routing';
import { AppComponent } from './app.component';

import { MatTabsModule, MatRadioModule, MatInputModule,
  MatFormFieldModule, MatIconModule, MatSelectModule, ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from '@angular/material';

import { ApiService } from './shared/services/api.service';
import { UserService } from './shared/services/user.service';
import { AuthGuard } from './shared/services/auth-guard';

import { ShareModule } from './shared/share.module';
import { MessageService } from 'primeng/components/common/messageservice';
import { DataTableModule, DialogModule, InputTextModule,
  SpinnerModule, ButtonModule, CheckboxModule, TooltipModule,
  GrowlModule, SharedModule } from 'primeng/primeng';



@NgModule({
  declarations: [
    AppComponent ],
  imports: [
    BrowserModule,
    CommonModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpModule,
    routing,
    ReactiveFormsModule,
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
    ShareModule
  ],
  providers: [
    ApiService,
    UserService,
    AuthGuard,
    MessageService,
    { provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
