import { Injectable, ReflectiveInjector } from '@angular/core';
import { CanActivate, Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { ApiService } from './api.service';
import { UserService } from './user.service';

class AuthConnectionErrorHandler {

  constructor(public owner: AuthGuard, public url: string) { }

  public handleConnectionError(error: Response | any) {
    this.owner.registerResult(false, this.url);
    return Observable.throw('error while checking connection to server');
  }
}

@Injectable()
export class AuthGuard implements CanActivate {

  static date: Date;

  static loadState() {
    let date = localStorage.getItem('user_auth_state_date');
    AuthGuard.date = date ? new Date(JSON.parse(date)) : new Date(2000, 0, 0);
  }

  static setSuccessDate(date?: Date) {
    AuthGuard.date = date || new Date();
    localStorage.setItem('user_auth_state_date', JSON.stringify(AuthGuard.date));
  }

  constructor(private apiService: ApiService, private router: Router, private userService: UserService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // user not logged in, force to re-login
    if (!this.userService.getLocal()) return this.registerResult(false, state.url);
    let handler = new AuthConnectionErrorHandler(this, state.url);

    let rez = this.checkServer(state.url).catch((err) => handler.handleConnectionError(err));

    if (!this.canBeAsync()) { // first request, sync mode
      return rez.take(1);
    } else {
      rez.subscribe();
    }
    return true;
  }

  checkServer(url: string): Observable<boolean> {
    return this.apiService.checkAuth().map(res => {
      console.log('auth OK');
      return this.registerResult(res.item, url);
    },
      err => {
        console.log('auth error');
        return this.registerResult(false, url)
      },

    );
  }

  public registerResult(result: boolean, url?: string): boolean {
    if (!result) {
      this.userService.clearLocal();
      this.redirectToLoginResult(url);
      AuthGuard.setSuccessDate(new Date(2000, 0, 0));
      return false;
    }

    return true;
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.canActivate(route, state);
  }

  private canBeAsync() {
    // we may perform async request only if this is not first one of previous check was performed not longer then
    // 5 minutes ago
    return (AuthGuard.date && this.getDiffInSeconds(AuthGuard.date) < 300);
  }

  private getDiffInSeconds(last: Date) {
    let diff = (new Date().getTime() - last.getTime());
    return diff / 1000; // sec
  }

  private redirectToLoginResult(url: string) {
    this.router.navigate(['./login'], { queryParams: { return: url } });
  }


}

/*One time initialization*/
AuthGuard.loadState();
if (window.addEventListener) {
  window.addEventListener('storage', storage_event, false);
}

function storage_event(e) {
  console.log('Auth state was updated from other tab...');
  AuthGuard.loadState();
}