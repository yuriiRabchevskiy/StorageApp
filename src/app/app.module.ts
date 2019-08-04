import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import 'rxjs/Rx';
import 'hammerjs';

import { routing } from './app.routing';
import { AppComponent } from './app.component';

import {
  MatTabsModule, MatRadioModule, MatInputModule,
  MatFormFieldModule, MatIconModule, MatSelectModule, ErrorStateMatcher, ShowOnDirtyErrorStateMatcher
} from '@angular/material';

import { ApiService } from './shared/services/api.service';
import { UserService } from './shared/services/user.service';
import { AuthGuard } from './shared/services/auth-guard';

import { ShareModule } from './shared/share.module';
import { MessageService } from 'primeng/components/common/messageservice';
import { TableModule } from 'primeng/table';
import { HttpClientModule } from '@angular/common/http';
import { TrackerService } from './shared/services/tracker.service';
import { DialogModule } from 'primeng/components/dialog/dialog';
import { InputTextModule } from 'primeng/components/inputtext/inputtext';
import { ButtonModule } from 'primeng/components/button/button';
import { SpinnerModule } from 'primeng/components/spinner/spinner';
import { CheckboxModule } from 'primeng/components/checkbox/checkbox';
import { TooltipModule } from 'primeng/components/tooltip/tooltip';
import { GrowlModule } from 'primeng/components/growl/growl';
import { SharedModule } from 'primeng/components/common/shared';



@NgModule({
  declarations: [
    AppComponent],
  imports: [
    BrowserModule,
    CommonModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    routing,
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
    ShareModule
  ],
  providers: [
    ApiService,
    TrackerService,
    UserService,
    AuthGuard,
    MessageService,
    { provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
