import { SelectItem } from 'primeng/primeng';
import { Component, Input } from '@angular/core';
// import { User } from "../../../models/users";

@Component({
  selector: 'user',
  templateUrl: './user.html',
  styleUrls: ['./user.scss']
})

export class UserComponent {
  // @Input() user: User;
  @Input() roles: any;

  // selectedUser: User;
  userRoles: any;

  constructor() {
    this.roles = [];
    this.roles.push({ label: 'Administrator', value: null });
    this.roles.push({ label: 'Internal User', value: { id: 1, name: 'Internal User', code: 'IU' } });
  }

  saveUser() {
    console.log('User is create');
  }


}
