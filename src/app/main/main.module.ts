import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ShareModule } from './../shared/share.module';

import { MainComponent } from './main.component';
import { ControlsModule } from '../controls/controls.module';

const routes: Routes = [{
    path: '', component: MainComponent,
    children: [
        { path: 'manage', loadChildren: () => import('app/manage/manage.module').then(m => m.ManageModule) },
        { path: 'storage', loadChildren: () => import('app/storage/storage.module').then(m => m.StorageModule) },
        { path: 'orders', loadChildren: () => import('app/orders/orders.module').then(m => m.OrdersModule) },
        { path: 'reports', loadChildren: () => import('app/reports/reports.module').then(m => m.ReportsModule) },
        { path: 'settings', loadChildren: () => import('app/settings/settings.module').then(m => m.SettingsModule) },
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