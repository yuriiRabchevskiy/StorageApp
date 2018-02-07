import { IChangePassword, ChangePassword } from './../../models/manage/user';
import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { IUser } from '../../models/manage/user';
import { Router } from '@angular/router';
import { ApiService } from '../../shared/services/api.service';
import { SecuredComponent } from '../../models/component/base-api.component';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { matchOtherValidator } from '../../shared/directive/math-validator';
import { MessageService } from 'primeng/components/common/messageservice';

@Component({
  selector: 'app-settings',
  templateUrl: './app-settings.component.html',
  styleUrls: ['./app-settings.component.scss']
})

export class AppSettingsComponent extends SecuredComponent implements OnInit {
  user: IUser;
  newPass: IChangePassword;
  hide: boolean = true;
  userForm: FormGroup;
  curentPassword: FormControl;
  newPassword: FormControl;
  confirmPassword: FormControl;

  constructor(private router: Router, private apiService: ApiService, private notifi: MessageService) {
    super();
    this.user = this.userService.getLocal();
  }

  ngOnInit() {
    this.createFormControls();
    this.createUserForm();
  }
  showValue() {
    this.hide = !this.hide;
  }

  createFormControls() {
    this.curentPassword = new FormControl('', Validators.required);
    this.newPassword = new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.pattern('^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[0-9])(?=.*?[#?!@$%^_+&*-]).{6,}$')
    ]);
    this.confirmPassword = new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      matchOtherValidator('newPassword')
    ]);
  }

  createUserForm() {
    this.userForm = new FormGroup({
      curentPassword: this.curentPassword,
      pass: new FormGroup({
        newPassword: this.newPassword,
        confirmPassword: this.confirmPassword,
      }),
    });
  }
  save(event) {
    event.preventDefault();
    if (this.userForm.valid) {
      this.changePassword(this.userForm.value);
      this.apiService.changePassword(this.newPass).subscribe(
        res => {
          if (res.success) {
            this.notifi.add(
              {
                severity: 'success',
                summary: 'Successfully',
                detail: 'Пароль змінено'
              });
          }
        },
        err => {
          this.notifi.add(
            {
              severity: 'error',
              summary: 'Error',
              detail: 'Пароль змінити не вдалося' + err
            });
          console.log(err);
        }
      );
    }
  }

  changePassword(val) {
    if (!val) {
      return;
    } else {
      let newPass = new ChangePassword();
      newPass.currentPassword = val.curentPassword;
      newPass.newPassword = val.pass.newPassword;
      this.newPass = newPass;
    }
    return this.newPass;
  }

  getErrorPass() {
    return this.curentPassword.hasError('required') ? "Пароль не введено" : '';
  }
  getNewErrorPass() {
    let regex = "a-z і A-Z, 0-9, #?!@$%^_+&*-";
    return this.newPassword.hasError('required') ? "Пароль не введено" :
      this.newPassword.hasError('minlength') ? 'Мінімально 6 символів' :
      this.newPassword.hasError('pattern') ? 'Пароль повинен містити ' + regex : '';
  }
  getErrorConfirmPass() {
    return this.confirmPassword.hasError('required') ? "Підтвердження не введено" : 
      this.confirmPassword.invalid ? 'Пароль не підтверджено' : '';
  }

}
