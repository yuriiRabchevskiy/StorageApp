import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './shared/services/auth-guard';

const appRoutes: Routes = [
    { path: 'login', loadChildren: './login/login.module#LoginModule' },

    // otherwise redirect to home
    { path: '', loadChildren: './main/main.module#MainModule', canActivate: [AuthGuard] },
    { path: '**', loadChildren: './main/main.module#MainModule', canActivate: [AuthGuard] },
];

export const routing = RouterModule.forRoot(appRoutes, { useHash: true });
