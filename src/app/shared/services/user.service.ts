import { Injectable } from '@angular/core';
import { ICurrentUser } from './../../models/manage/user';

@Injectable()
export class UserService {

  private static user: ICurrentUser;

  static updateUser() {
    UserService.user = JSON.parse(localStorage.getItem('user'));
  }

  setLocal(user: ICurrentUser) {
    UserService.user = user;
    localStorage.setItem('user', JSON.stringify(user));
  }

  getLocal(): ICurrentUser {
    return UserService.user;
  }

  clearLocal() {
    localStorage.removeItem('user');
    UserService.user = null;
  }
}

UserService.updateUser();
if (window.addEventListener) {
  window.addEventListener('storage', storage_event, false);
}

function storage_event(e) {
  console.log('User updated from other tab');
  UserService.updateUser();
}
