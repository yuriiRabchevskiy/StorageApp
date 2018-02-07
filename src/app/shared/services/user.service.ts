import { Injectable, EventEmitter } from '@angular/core';
import { IDictionary, Dictionary } from './../../models/dictionary';
import { IUser } from './../../models/manage/user';

@Injectable()
export class UserService {

  private static user: IUser;

  static updateUser() {
    UserService.user = JSON.parse(localStorage.getItem('user'));
  }

  setLocal(user: IUser) {
    UserService.user = user;
    localStorage.setItem('user', JSON.stringify(user));
  }

  getLocal(): IUser {
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