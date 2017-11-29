import { Component, OnChanges, Input } from '@angular/core';
import { User } from "../../shared/models/user";
import { UserService } from "../../shared/services/user.service";
import { AlertService } from "../../shared/services/alert.service";

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnChanges {
  @Input() user: User;
  loading = false;
  selectedUser: User;

  constructor(private userService: UserService,
    private alertService: AlertService) { }

  ngOnChanges() {
    this.selectedUser = this.user
  }

  saveUser() {
    this.loading = true;
    this.userService.create(this.selectedUser)
    .subscribe(
        data => {
            // set success message and pass true paramater to persist the message after redirecting to the login page
            this.alertService.success('Registration successful', true);
        },
        error => {
            this.alertService.error(error);
            this.loading = false;
        });
  }

}
