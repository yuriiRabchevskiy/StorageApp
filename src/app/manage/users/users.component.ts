import { ApiService } from './../../shared/services/api.service';
import { SelectItem } from 'primeng/primeng';
import { IUser, User } from './../../models/users';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'users',
  templateUrl: './users.html',
  styleUrls: ['./users.scss'],
  providers: [ApiService]
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  roles: SelectItem[];
  error: any;

  items: any;
  user: User = new User();
  selectedUser: User;
  newUser: boolean;
  displayDialog: boolean;

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.apiService.getUsers().subscribe(
      data => this.users = data,
      error => {
        this.error = error;
        console.log(error);
      });
    console.log(this.users);
    this.roles = [{ label: 'Administrator', value: null },
    { label: 'Internal User', value: 'Internal' }];
  }

  showDialog() {
    this.newUser = true;
    this.user = new User();
    this.displayDialog = true;
  }

  save() {
    if (this.newUser) {
      this.users.push(this.user);
    } else {
      this.users[this.findUserIndex()] = this.user;
    }
    this.user = null;
    this.displayDialog = false;
  }

  delete() {
    const index = this.findUserIndex();
    this.users = this.users.filter((val, i) => i !== index);
    this.user = null;
    this.displayDialog = false;
  }

  findUserIndex(): number {
    return this.users.indexOf(this.selectedUser);
  }

  addItem() {
    // this.userService.addUser(user);
  }
}
