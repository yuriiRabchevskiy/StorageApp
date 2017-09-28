import { DataService } from './shared/table-service';


import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { ManageComponent } from './manage/manage.component';
import { StorageComponent } from './storage/storage.component';

import { ShareModule } from './shared/share.module';
import { DataTableModule, DialogModule, SharedModule } from 'primeng/primeng';
const routs: Routes = [
  { path: '', component: ManageComponent},
  { path: 'storage', component: StorageComponent},
  { path: '**', redirectTo: '/' }
];

@NgModule({
  declarations: [
    AppComponent, ManageComponent, StorageComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routs),
    BrowserAnimationsModule,
    FormsModule,
    HttpModule,
    ShareModule,
    DataTableModule,
    DialogModule, SharedModule
  ],
  providers: [DataService],
  bootstrap: [AppComponent]
})
export class AppModule { }
