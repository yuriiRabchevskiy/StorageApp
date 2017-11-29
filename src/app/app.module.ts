import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpModule, BaseRequestOptions } from '@angular/http';

import { routing } from "./app.routing";
import { AppComponent } from './app.component';
import { DataTableModule, DialogModule, InputTextModule, DropdownModule, ButtonModule, SharedModule, TabViewModule } from 'primeng/primeng';
import { AlertService } from './shared/services/alert.service';
import { AuthGuard } from './shared/auth.guard';
import { AuthenticationService } from "./shared/services/authentication.service";
import { ApiService } from "./shared/services/api.service";
import { UserService } from "./shared/services/user.service";
import { LugageService } from "./shared/services/lugage.service";

import { RegisterComponent } from './register/register.component';
import { ShareModule } from './shared/share.module';

// fake backend
import { fakeBackendProvider } from "./shared/fake-backend";
import { MockBackend } from "@angular/http/testing";

@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpModule,
    routing,
    DataTableModule,
    DropdownModule,
    DialogModule,
    InputTextModule, 
    ButtonModule,
    TabViewModule,
    SharedModule,
    ShareModule
  ],
  providers: [AuthGuard,
    AlertService,
    AuthenticationService,
    ApiService,
    UserService,
    LugageService,
    fakeBackendProvider,
    MockBackend,
    BaseRequestOptions],
  bootstrap: [AppComponent]
})
export class AppModule {}
