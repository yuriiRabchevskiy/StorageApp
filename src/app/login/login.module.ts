import { LoginComponent } from './login.component';
import { ShareModule } from './../shared/share.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from "../shared/auth.guard";

const routes: Routes = [
    { path: '', component: LoginComponent }
];

@NgModule({
    declarations: [LoginComponent],
    imports: [
        CommonModule,
        ShareModule,
        RouterModule.forChild(routes),
    ],
    providers: []
})

export class LoginModule {
}