import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'login',
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent implements OnInit {
  private desiredUrl = '/home';

  constructor(private router: Router) {
    const returnUrl = '#/login';
  }

  ngOnInit() {
    // /**
    //  * Redirect to home page if user is logged.
    //  */
    // this.router.navigate([this.desiredUrl]);
  }
}
