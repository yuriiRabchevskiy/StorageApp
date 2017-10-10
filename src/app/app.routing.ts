import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

export const routes: Routes = [
  // Login page for not logged user.
  // { path: 'login', loadChildren: './other-pages/login/login.module#LoginModule' },
  // Top level screen.
  { path: '', loadChildren: './other-pages/main.module#MainModule' },
  { path: '**', loadChildren: './other-pages/main.module#MainModule' },
];

@NgModule ({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})

export class AppRoutingModule {

}
