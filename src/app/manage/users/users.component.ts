import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PreferenceService } from '@app/shared/services/preference.service';
import { UserService } from '@app/shared/services/user.service';
import { MessageService } from 'primeng/api';
import { ApiResponse } from '../../models/api';
import { ApiListComponent } from '../../models/component/list-api.component';
import { ApiService } from '../../shared/services/api.service';
import { ISUser, IUserToEdit } from './../../models/manage';
import { IUser, UserRoleName } from './../../models/manage/user';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent extends ApiListComponent<ISUser> {
  selectedItem: ISUser;

  displayDialog: boolean = false;
  displayEditDialog: boolean = false;
  showConfirm: boolean = false;

  constructor(userService: UserService, private apiService: ApiService,
    public router: Router, notify: MessageService, preferences: PreferenceService) {
    super(userService, notify, preferences);
  }

  getUserRole(user: IUser) {
   return UserRoleName.getRoleName(user.isAdmin, user.role);
  }

  onRowClick(user: ISUser) {
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


  delete(val: ISUser) {
    const deleteUser = val;
    this.work.showSpinner = true;
    this.apiService.deleteUser(deleteUser.id).subscribe(
      res => {
        this.work.showSpinner = false;
        if (res.success) {
          this.remove(deleteUser);
          this.notify.add(
            {
              severity: 'success',
              summary: 'Successfully',
              detail: 'Користувача видалено'
            });
        }
      },
      err => {
        this.work.showSpinner = false;
        this.notify.add(
          {
            severity: 'error',
            summary: 'Error',
            detail: 'Користувача не видалено' + err
          });
      }
    );
    if (this.filteredData.length > 0) {
      this.selectedItem = this.filteredData[0];
    }
  }

  save(val: ISUser) {
    const user = val;
    this.apiService.addUser(user).subscribe(
      res => {
        if (res.success) {
          user.id = res.item;
          this.notify.add(
            {
              severity: 'success',
              summary: 'Successfully',
              detail: 'Користувача додано'
            });
          this.add(user);
          this.selectedItem = user;
        } else {
          this.notify.add(
            {
              severity: 'error',
              summary: 'Error',
              detail: 'Користувача не додано: ' + res.errors[0].message
            }
          );
        }
      },
      err => {
        this.notify.add(
          {
            severity: 'error',
            summary: 'Error',
            detail: 'Користувача не додано' + err
          });
      }
    );
    this.displayDialog = false;
  }

  saveChange(val: IUserToEdit) {
    const user = val;
    this.updateField(this.selectedItem, val);
    this.apiService.editUser(this.selectedItem.id, user).subscribe(
      res => {
        if (res.success) {
          this.notify.add(
            {
              severity: 'success',
              summary: 'Successfully',
              detail: 'Зміни збережено'
            });
        }
      },
      err => {
        this.notify.add(
          {
            severity: 'error',
            summary: 'Error',
            detail: 'Зміни не збережено' + err
          });
        console.log(err);
      }
    );
    this.selectedItem = this.filteredData[0];
    this.displayEditDialog = false;
  }

  doGetData() {
    return this.apiService.getUsers();
  }

  onDataReceived(res: ApiResponse<ISUser>) {
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
  updateField(user: ISUser, val) {
    Object.keys(val).map(key => user[key] = val[key]);
  }

}
