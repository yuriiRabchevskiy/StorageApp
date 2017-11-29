import { Routes, RouterModule } from '@angular/router';
// import { LoginComponent } from "./login/login.component";
import { AuthGuard } from './shared/auth.guard';
import { RegisterComponent } from './register/register.component';

const appRoutes: Routes = [
    { path: 'login', loadChildren: './login/login.module#LoginModule' },
    { path: 'register', component: RegisterComponent },

    // otherwise redirect to home
    { path: '', loadChildren: './main/main.module#MainModule', canActivate: [AuthGuard] },
    { path: '**', loadChildren: './main/main.module#MainModule', canActivate: [AuthGuard] },
];

export const routing = RouterModule.forRoot(appRoutes, { useHash: true });