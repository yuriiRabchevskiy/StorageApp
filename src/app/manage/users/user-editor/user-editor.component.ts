import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserRoleName, detDiscountPercent } from '@app/models/manage/user';
import { IUser, IUserToEdit, UserToEdit } from '../../../models/manage';

@Component({
  selector: 'app-user-editor',
  templateUrl: './user-editor.component.html',
  styleUrls: ['./user-editor.component.scss']
})

export class UserEditorComponent implements OnInit {
  userForm: FormGroup;
  login: FormControl;
  name: FormControl;
  surname: FormControl;
  phone: FormControl;
  dropAddress: FormControl;
  notes: FormControl;
  role: FormControl;
  discountPercent: FormControl;

  UserRoleName = UserRoleName;
  userRoles = UserRoleName.selectionList;

  _user: IUser;
  userToEdit: IUserToEdit;
  get user() {
    return this._user;
  }
  @Input() set user(val: IUser) {
    this._user = val;
    if (!this._user) return;
    this.userToEdit = new UserToEdit(val);
  }

  @Output() onCloseDialog: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() saveChange: EventEmitter<IUserToEdit> = new EventEmitter<IUserToEdit>();

  constructor(public router: Router) {
  }

  ngOnInit() {
    this.createFormControls();
    this.createUserForm();
  }

  createFormControls() {
    const discountPercent = detDiscountPercent(this.userToEdit.discountMultipliers)
    this.login = new FormControl(this.userToEdit.login, [
      Validators.required
    ]);
    this.name = new FormControl(this.userToEdit.name);
    this.surname = new FormControl(this.userToEdit.surname);
    this.phone = new FormControl(this.userToEdit.phone);
    this.dropAddress = new FormControl(this.userToEdit.dropAddress);
    this.role = new FormControl(this.userToEdit.role);
    this.notes = new FormControl(this.userToEdit.notes);
    this.discountPercent = new FormControl(discountPercent);
  }

  createUserForm() {
    this.userForm = new FormGroup({
      login: this.login,
      name: this.name,
      surname: this.surname,
      phone: this.phone,
      dropAddress: this.dropAddress,
      role: this.role,
      notes: this.notes,
      discountPercent: this.discountPercent
    });
  }

  save(event: Event) {
    event.preventDefault();
    if (!this.userForm.valid) return;
    const result: IUserToEdit = {
      ...this.userForm.value
    }
    result.discountMultipliers = [(1 - this.discountPercent.value / 100)];
    this.saveChange.emit(result);
  }

  closeDialog() {
    this.onCloseDialog.emit(false);
  }


}
