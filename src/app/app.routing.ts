import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './shared/services/auth-guard';

const appRoutes: Routes = [
    { path: 'login', loadChildren: () => import('./login/login.module').then(m => m.LoginModule) },

    // otherwise redirect to home
    { path: '', loadChildren: () => import('./main/main.module').then(m => m.MainModule), canActivate: [AuthGuard] },
    { path: '**', loadChildren: () => import('./main/main.module').then(m => m.MainModule), canActivate: [AuthGuard] },
];

export const routing = RouterModule.forRoot(appRoutes, { useHash: true });
