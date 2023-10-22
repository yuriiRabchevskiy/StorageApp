import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { matchOtherValidator } from '../../../shared/directive/math-validator';
import { ApiService } from '../../../shared/services/api.service';
import { ISUser } from './../../../models/manage';
import { User, UserRoleName } from './../../../models/manage/user';

export function nameValidator(items: ISUser[]): ValidatorFn {
  return (control: AbstractControl): any => {
    const name = items.some(it => it.login === control.value);
    return name ? { invalid: control.value } : null;
  };
}

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  hide: boolean = true;
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
  role: FormControl;
  userRoles = [
    { label: 'Адміністратор', value: UserRoleName.admin },
    { label: 'Помічник Адміністратора', value: UserRoleName.adminAssistant },
    { label: 'Продавець', value: UserRoleName.user },
    { label: 'Клієнт', value: UserRoleName.client },
    { label: 'Завскладу', value: UserRoleName.warehouseManager }    
  ];

  user: ISUser;

  @Input() userList: ISUser[] = [];

  @Output() onCloseDialog: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() saveUser: EventEmitter<ISUser> = new EventEmitter<ISUser>();

  constructor(private apiService: ApiService, public router: Router,
    iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
    iconRegistry.addSvgIcon(
      'visibility',
      sanitizer.bypassSecurityTrustResourceUrl('assets/matSVG/visibility.svg'));
    iconRegistry.addSvgIcon(
      'visibility-off',
      sanitizer.bypassSecurityTrustResourceUrl('assets/matSVG/visibility_off.svg'));
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
      Validators.email
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
    this.role = new FormControl(this.userRoles[2].value, Validators.required);
  }

  showValue() {
    this.hide = !this.hide;
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
      role: this.role
    });
  }

  save(event) {
    event.preventDefault();
    if (this.userForm.valid) {
      this.createUser(this.userForm.value);
      this.saveUser.emit(this.user);
    }
  }
  createUser(val: any) {
    if (!val) return;

    const newUser = new User();
    newUser.email = val.email;
    newUser.login = val.login;
    newUser.password = val.pass.password;
    newUser.isActive = true;
    newUser.isAdmin = val.role === UserRoleName.admin;
    newUser.role = val.role;
    newUser.name = val.name;
    newUser.surname = val.surName;
    newUser.phone = val.phone;
    newUser.notes = val.notes;
    this.user = newUser;

    return this.user;
  }

  closeDialog() {
    this.onCloseDialog.emit(false);
  }

  getErrorEmail() {
    return this.email.hasError('required') ? 'Емейл не введено' :
      this.email.hasError('email') ? 'Не валідний емейл' : '';
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
    const regex = "a-z і A-Z, 0-9, #?!@$%^_+&*-";
    return this.password.hasError('required') ? "Пароль не введено" :
      this.password.hasError('minlength') ? 'Мінімально 6 символів' :
        this.password.hasError('pattern') ? 'Пароль повинен містити ' + regex : '';
  }
  getErrorConfirmPass() {
    return this.confirmPassword.hasError('required') ? "Підтвердження не введено" :
      this.confirmPassword.invalid ? 'Пароль не підтверджено' : '';
  }

}
