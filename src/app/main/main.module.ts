import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ShareModule } from './../shared/share.module';

import { MainComponent } from './main.component';
import { ControlsModule } from '../controls/controls.module';

const routes: Routes = [{
    path: '', component: MainComponent,
    children: [
        { path: 'manage', loadChildren: 'app/manage/manage.module#ManageModule' },
        { path: 'storage', loadChildren: 'app/storage/storage.module#StorageModule' },
        { path: 'orders', loadChildren: 'app/orders/orders.module#OrdersModule' },
        { path: 'reports', loadChildren: 'app/reports/reports.module#ReportsModule' },
        { path: 'settings', loadChildren: 'app/settings/settings.module#SettingsModule' },
        // Unexpected URL handling.
        { path: '', redirectTo: 'storage', pathMatch: 'full' },
        { path: '**', redirectTo: 'storage', pathMatch: 'full' }
    ]
}];
@NgModule({
    declarations: [MainComponent],
    imports: [
        CommonModule,
        ControlsModule,
        ShareModule,
        RouterModule.forChild(routes),
    ],
    providers: []
})

export class MainModule {
}