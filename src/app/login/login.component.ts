import { ForgotPassword, IApiErrorResponse } from './../models/api/api/api';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, Validators, FormGroup } from '@angular/forms';

import { StringExtensions } from '../shared/helpers/index';
import { ApiService } from '../shared/services/api.service';
import { IForgotPassword } from '../models/api';
import { UserService } from '../shared/services/user.service';

import { Dictionary } from './../models/dictionary';
import { MessageService } from 'primeng/api';

interface IUrlParamsPair {
  url: string;
  params: Dictionary<string>;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit {

  loginControl = new FormControl('', Validators.required);
  passwordControl = new FormControl('', [Validators.required]);
  emailControl = new FormControl('', [Validators.required, Validators.email]);

  loginForm = new FormGroup({
    login: this.loginControl,
    password: this.passwordControl
  });
  forgotForm = new FormGroup({
    email: this.emailControl
  });
  token: string;
  returnUrl: string;
  isLogged: any;
  forgotPass: IForgotPassword;
  showForgotDialog: boolean = false;

  connectionError: boolean;
  error: boolean;
  private desiredUrl: string = '/storage';

  constructor(private apiService: ApiService, public userService: UserService,
    private router: Router, private activeRoute: ActivatedRoute, private notify: MessageService) {
    let query = this.activeRoute.snapshot.queryParams;
    let returnUrl = <string>query['return'];
    if (returnUrl && !returnUrl.startsWith('#/login'))
      this.desiredUrl = StringExtensions.cutStart(returnUrl, '#');
    // // get return url from route parameters or default to '/'
    // this.returnUrl = this.router.snapshot.queryParams['returnUrl'] || '/';
  }

  ngOnInit() {
    /**
     * Redirect to home page if user is logged.
     */
    this.isLogged = this.userService.getLocal();
    if (this.isLogged) {
      this.router.navigate([this.desiredUrl]);
    }
  }

  onSubmit(data: any) {
    let urlAndParams = this.separateUrlAndParams(this.desiredUrl);
    this.connectionError = false;
    this.error = false;

    this.apiService.login(data).subscribe({
      next: (res) => {
        this.error = false;
        this.apiService.token = res.item.token;
        this.userService.setLocal(res.item);
        if (res.item.isAdmin) {
          this.router.navigate([urlAndParams.url], { queryParams: urlAndParams.params });
        } else {
          this.router.navigate(['/storage']);
        }
      },
      error: (err: IApiErrorResponse) => {
        this.connectionError = err.wasConnectionError; // connection error
        this.error = !err.wasConnectionError; // or credentials error
      }
    });
  }

  separateUrlAndParams(url: string): IUrlParamsPair {
    const urlAndParams = this.desiredUrl.split('?');
    const baseUrl = urlAndParams[0];
    let params = null;
    const paramsDictionary = new Dictionary<string>();
    if (urlAndParams.length > 1) {
      params = urlAndParams[1]
      let splittedParams = params.split('&');
      splittedParams.forEach(element => {
        let key = element.split('=')[0];
        let value = element.split('=')[1];
        paramsDictionary[key] = value;
      });
    }
    let rez: IUrlParamsPair = { url: baseUrl, params: paramsDictionary };
    return rez;
  }

  forgot(event: IForgotPassword) {
    let data = new ForgotPassword();
    data.email = event.email;
    this.forgotPass = data;
    this.apiService.forgotPassword(this.forgotPass).subscribe({
      next: res => {
        this.notify.add(
          {
            severity: 'success',
            summary: 'Successfully',
            detail: 'Лист відправлено'
          });
      },
      error: (err: IApiErrorResponse) => {
        this.notify.add(
          {
            severity: 'error',
            summary: 'Error',
            detail: 'Лист відправити не вдалося' + err.errors[0].message
          });
      }
    }
    );
  }

  forgotPassword() {
    this.showForgotDialog = !this.showForgotDialog;
  }
  closeForgotDialog() {
    this.showForgotDialog = false;
  }

}
