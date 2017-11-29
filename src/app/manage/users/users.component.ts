import { Component, OnInit } from '@angular/core';
import { User } from "../../shared/models/user";
import { UserService } from "../../shared/services/user.service";

class NewUser implements User {
  id: number;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  constructor() {
       this.id = 123;
       this.username = '';
       this.password = '';
       this.firstName = '';
       this.lastName = '';
     }
}

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  users: User[] = [];

  user: User = new NewUser();
  selectedUser: User;
  newUser: boolean;
  constructor(private userService: UserService) {
  }

  ngOnInit() {
    this.loadAllUsers();
  }

  addNewUser() {
    this.newUser = true;
    this.user = new NewUser();
    let users = [...this.users];
    users.push(this.user);
    this.selectedUser = this.user;
    this.users = users;
    this.user = null;
  }

  deleteUser(id: number) {
    this.userService.delete(id).subscribe(() => { this.loadAllUsers() });
    this.selectedUser = this.users[0];
  }

  onRowSelect(event) {
    this.selectedUser = event.data;
  }

  private loadAllUsers() {
    this.userService.getAll().subscribe(users => { 
      this.users = users;
      this.selectedUser = this.users[0];
      console.log('Users: ', this.users);
    });
  }

}
