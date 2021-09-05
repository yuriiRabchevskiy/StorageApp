import { ISUser, IUserToEdit, UserToEdit } from './../../models/manage';
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators, AbstractControl, ValidatorFn } from '@angular/forms';

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
  isAdmin: FormControl;
  isAdminAssistant: FormControl;

  userRoles = [
    { label: 'Адміністратор', value: true },
    { label: 'Продавець', value: false }
  ];

  userAssistantRoles = [
    { label: 'Помічник Адміністратора', value: true },
    { label: 'Продавець', value: false }
  ];

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

  constructor(private apiService: ApiService, public router: Router) {
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
    this.isAdmin = new FormControl(this.userToEdit.isAdmin);
    this.isAdminAssistant = new FormControl(this.userToEdit.isAdminAssistant);
    this.notes = new FormControl(this.userToEdit.notes);
  }

  createUserForm() {
    this.userForm = new FormGroup({
      login: this.login,
      name: this.name,
      surname: this.surname,
      phone: this.phone,
      isAdmin: this.isAdmin,
      isAdminAssistant: this.isAdminAssistant,
      notes: this.notes,
    });
  }

  save(event) {
    event.preventDefault();
    if (this.userForm.valid) {
      this.saveChange.emit(this.userForm.value);
    }
  }

  closeDialog() {
    this.onCloseDialog.emit(false);
  }
}
