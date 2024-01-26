import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserRoleName } from '@app/models/manage/user';
import { ISUser, IUserToEdit, UserToEdit } from './../../models/manage';

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
  notes: FormControl;
  role: FormControl;
  discountPercent: FormControl;

  UserRoleName = UserRoleName;
  userRoles = UserRoleName.selectionList;

  _user: ISUser;
  userToEdit: IUserToEdit;
  get user() {
    return this._user;
  }
  @Input() set user(val: ISUser) {
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
    const discountPercent = this.detDiscountPercent(this.userToEdit.discounts)
    this.login = new FormControl(this.userToEdit.login, [
      Validators.required
    ]);
    this.name = new FormControl(this.userToEdit.name);
    this.surname = new FormControl(this.userToEdit.surname);
    this.phone = new FormControl(this.userToEdit.phone);
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
    result.discounts = [this.discountPercent.value];
    this.saveChange.emit(result);
  }

  closeDialog() {
    this.onCloseDialog.emit(false);
  }

  private detDiscountPercent(discounts?: number[]) {
    if (!discounts || discounts.length !== 1) return 0;
    const discountMultiplier = discounts[0];
    if (discountMultiplier < 0 || discountMultiplier > 1) return 0;
    return (1 - discountMultiplier) * 100;
  }
}
