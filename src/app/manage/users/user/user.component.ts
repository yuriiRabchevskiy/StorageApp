import { User, IUser } from './../../../models/manage/user';
import { Component, Input, EventEmitter, Output, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../shared/services/api.service';
import { ISUser } from './../../../models/manage';
import { FormGroup, FormControl, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { matchOtherValidator } from '../../../shared/directive/math-validator';

export function nameValidator(items: ISUser[]): ValidatorFn {
  return (control: AbstractControl): any => {
    const name = items.some(it => it.login === control.value);
    return name ? {invalid: control.value} : null;
  };
}

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  hide: boolean = true;
  confHide: boolean = true;
  userForm: FormGroup;

  login: FormControl;
  name: FormControl;
  surName: FormControl;
  phone: FormControl;
  notes: FormControl;
  email: FormControl;
  pass: FormGroup;
  password: FormControl;
  confirmPassword: FormControl;
  isAdmin: FormControl;
  userRoles = [
    { label: 'Адміністратор', value: true },
    { label: 'Продавець', value: false }
  ];

  user: ISUser;

  @Input() userList: ISUser[] = [];

  @Output() onCloseDialog: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() saveUser: EventEmitter<ISUser> = new EventEmitter<ISUser>();

  constructor(private apiService: ApiService, public router: Router) {
  }

  ngOnInit() {
    this.createFormControls();
    this.createUserForm();
  }
  createFormControls() {
    this.login = new FormControl('', Validators.compose([
      Validators.required,
      nameValidator(this.userList)
    ]));
    this.name = new FormControl('', Validators.required);
    this.surName = new FormControl('', Validators.required);
    this.phone = new FormControl('');
    this.notes = new FormControl('');
    this.email = new FormControl('', [
      Validators.required,
      Validators.pattern('^[^\s@]+@[^\s@]+[.][^\s@]+$')
    ]);
    this.password = new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.pattern('^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[0-9])(?=.*?[#?!@$%^_+&*-]).{6,}$')
    ]);
    this.confirmPassword = new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      matchOtherValidator('password')
    ]);
    this.isAdmin = new FormControl(this.userRoles[1].value, Validators.required);
  }

  createUserForm() {
    this.userForm = new FormGroup({
      login: this.login,
      name: this.name,
      surName: this.surName,
      phone: this.phone,
      notes: this.notes,
      email: this.email,
      pass: new FormGroup({
        password: this.password,
        confirmPassword: this.confirmPassword,
      }),
      isAdmin: this.isAdmin
    });
  }

  save(event) {
    event.preventDefault();
    if (this.userForm.valid) {
      this.createUser(this.userForm.value);
      this.saveUser.emit(this.user);
    }
  }
  createUser(val) {
    if (!val) {
      return;
    } else {
      let newUser = new User();
      newUser.email = val.email;
      newUser.login = val.login;
      newUser.password = val.pass.password;
      newUser.isActive = true;
      newUser.isAdmin = val.isAdmin;
      newUser.name = val.name;
      newUser.surname = val.surName;
      newUser.phone = val.phone;
      newUser.notes = val.notes;
      this.user = newUser;
    }
    return this.user;
  }
  closeDialog() {
    this.onCloseDialog.emit(false);
  }

  getErrorEmail() {
    return this.email.hasError('required') ? 'Емейл не введено' :
      this.email.hasError('pattern') ? 'Не валідний емейл' : '';
  }
  getErrorLogin() {
    return this.login.hasError('required') ? 'Логін не введено' :
           this.login.invalid ? 'Логін уже існує' : '';
  }
  getErrorSurName() {
    return this.surName.hasError('required') ? 'Фамілію не введено' : '';
  }
  getErrorName() {
    return this.name.hasError('required') ? "І'мя не введено" : '';
  }
  getErrorPass() {
    let regex = "a-z і A-Z, 0-9, #?!@$%^_+&*-";
    return this.password.hasError('required') ? "Пароль не введено" :
      this.password.hasError('minlength') ? 'Мінімально 6 символів' :
      this.password.hasError('pattern') ? 'Пароль повинен містити ' + regex : '';
  }
  getErrorConfirmPass() {
    return this.confirmPassword.hasError('required') ? "Підтвердження не введено" : 
      this.confirmPassword.invalid ? 'Пароль не підтверджено' : '';
  }

}
