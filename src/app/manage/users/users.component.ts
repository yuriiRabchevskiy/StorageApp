import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PreferenceService } from '@app/shared/services/preference.service';
import { UserService } from '@app/shared/services/user.service';
import { MessageService } from 'primeng/api';
import { ApiResponse, IApiErrorResponse } from '../../models/api';
import { ApiListComponent } from '../../models/component/list-api.component';
import { ApiService } from '../../shared/services/api.service';
import { IUser, IUserToEdit } from './../../models/manage';
import { ICurrentUser, UserRoleName } from './../../models/manage/user';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent extends ApiListComponent<IUser> {
  selectedItem: IUser;

  displayDialog: boolean = false;
  displayEditDialog: boolean = false;
  showConfirm: boolean = false;

  constructor(userService: UserService, private apiService: ApiService,
    public router: Router, notify: MessageService, preferences: PreferenceService) {
    super(userService, notify, preferences);
  }

  getUserRole(user: ICurrentUser) {
    return UserRoleName.getRoleName(user.isAdmin, user.role);
  }

  onRowClick(user: IUser) {
    if (this.selectedItem.id !== user.id) {
      this.selectedItem = user;
      return;
    }
    this.displayEditDialog = true;
  }

  addNewUser() {
    this.displayDialog = true;
  }

  confirmDelete(val: boolean) {
    if (!val) {
      this.showConfirm = false;
      return;
    }
    this.delete(this.selectedItem);
    this.showConfirm = false;
  }

  confirmation() {
    this.showConfirm = true;
  }


  delete(val: IUser) {
    const deleteUser = val;
    this.work.showSpinner = true;
    this.apiService.deleteUser(deleteUser.id).subscribe({
      next: res => {
        this.work.showSpinner = false;
        this.remove(deleteUser);
        this.notify.add(
          {
            severity: 'success',
            summary: 'Successfully',
            detail: 'Користувача видалено'
          });
      },
      error: (err: IApiErrorResponse) => {
        this.work.showSpinner = false;
        this.notify.add(
          {
            severity: 'error',
            summary: 'Error',
            detail: 'Користувача не видалено' + err.errors[0].message
          });
      }
    });
    if (this.filteredData.length > 0) {
      this.selectedItem = this.filteredData[0];
    }
  }

  save(val: IUser) {
    const user = val;
    this.apiService.addUser(user).subscribe({
      next: res => {
        user.id = res.item;
        this.notify.add(
          {
            severity: 'success',
            summary: 'Successfully',
            detail: 'Користувача додано'
          });
        this.add(user);
        this.selectedItem = user;
      },
      error: (err: IApiErrorResponse) => {
        this.notify.add(
          {
            severity: 'error',
            summary: 'Error',
            detail: 'Користувача не додано' + err.errors[0].message
          });
      }
    });
    this.displayDialog = false;
  }

  saveChange(val: IUserToEdit) {
    const user = val;
    this.updateField(this.selectedItem, val);
    this.apiService.editUser(this.selectedItem.id, user).subscribe({
      next: res => {
        this.notify.add(
          {
            severity: 'success',
            summary: 'Successfully',
            detail: 'Зміни збережено'
          });
      },
      error: (err: IApiErrorResponse) => {
        this.notify.add(
          {
            severity: 'error',
            summary: 'Error',
            detail: 'Зміни не збережено' + err
          });
        console.log(err);
      }
    });
    this.selectedItem = this.filteredData[0];
    this.displayEditDialog = false;
  }

  doGetData() {
    return this.apiService.getUsers();
  }

  onDataReceived(res: ApiResponse<IUser>) {
    super.onDataReceived(res);
  }

  showToEdit() {
    this.displayEditDialog = true;
  }

  public closeDialog(event) {
    this.displayEditDialog = event;
    this.displayDialog = event;
    if (this.filteredData.length < 1) return;
    this.selectedItem = this.filteredData[0];
  }

  // for update field in p-table
  updateField(user: IUser, val) {
    Object.keys(val).map(key => user[key] = val[key]);
  }

}
