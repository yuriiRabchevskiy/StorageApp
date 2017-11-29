import { ShareModule } from './../shared/share.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from "./main.component";
import { HomeComponent } from './../home/home.component';
import { AuthGuard } from "../shared/auth.guard";
import { AlertComponent } from '../alert/alert.component';

const routes: Routes = [{
    path: '', component: MainComponent,
    children: [
        { path: 'home', component: HomeComponent },
        { path: 'manage', loadChildren: 'app/manage/manage.module#ManageModule' },
        { path: 'storage', loadChildren: 'app/storage/storage.module#StorageModule' },
        // Unexpected URL handling.
        { path: '', redirectTo: 'home', pathMatch: 'full' },
        { path: '**', redirectTo: 'home', pathMatch: 'full' }
    ]
}];
@NgModule({
    declarations: [MainComponent, HomeComponent, AlertComponent],
    imports: [
        CommonModule,
        ShareModule,
        RouterModule.forChild(routes),
    ],
    providers: []
})

export class MainModule {
}