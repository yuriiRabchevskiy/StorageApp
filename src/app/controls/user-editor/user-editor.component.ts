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
    this.login = new FormControl(this.userToEdit.login, [
      Validators.required
    ]);
    this.name = new FormControl(this.userToEdit.name);
    this.surname = new FormControl(this.userToEdit.surname);
    this.phone = new FormControl(this.userToEdit.phone);
    this.role = new FormControl(this.userToEdit.role);
    this.notes = new FormControl(this.userToEdit.notes);
  }

  createUserForm() {
    this.userForm = new FormGroup({
      login: this.login,
      name: this.name,
      surname: this.surname,
      phone: this.phone,
      role: this.role,
      notes: this.notes,
    });
  }

  save(event: Event) {
    event.preventDefault();
    if (!this.userForm.valid) return;
    this.saveChange.emit(this.userForm.value);
  }

  closeDialog() {
    this.onCloseDialog.emit(false);
  }
}
