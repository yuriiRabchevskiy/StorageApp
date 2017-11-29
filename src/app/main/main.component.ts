import { Component, OnInit } from '@angular/core';
import { UserService } from '../shared/services/user.service';
import { User } from '../shared/models/user';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  currentUser: User;
  pages = ['manage', 'storage'];
  page: string = 'home';

  private _selectedPage: any;
  get selectedPage() {
    return this._selectedPage;
  }
  set selectedPage(page: any) {
    this.selectPage(page);
  }

  constructor(private userService: UserService) {
    this.selectedPage = this.page;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
  }

  ngOnInit() {
  }

  selectPage(page: any) {
    this._selectedPage = page;
  }

}
