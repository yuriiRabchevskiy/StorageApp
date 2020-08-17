import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import 'hammerjs';
import { MessageService, SharedModule } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SpinnerModule } from 'primeng/spinner';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { AppComponent } from './app.component';
import { routing } from './app.routing';
import { ApiService } from './shared/services/api.service';
import { AuthGuard } from './shared/services/auth-guard';
import { TrackerService } from './shared/services/tracker.service';
import { UserService } from './shared/services/user.service';
import { ShareModule } from './shared/share.module';





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
    ToastModule,
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
