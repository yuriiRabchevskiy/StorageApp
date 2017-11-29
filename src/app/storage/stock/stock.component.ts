import { LugageService } from './../../shared/services/lugage.service';
import { Lugage } from './../../shared/models/lugage';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.scss']
})
export class StockComponent implements OnInit {
  fake: Lugage[] = [];
  fake2 = [];
  fake3 = [];
  constructor(private lugageService: LugageService) { }

  ngOnInit() {
    this.loadDbFake();
  }

  private loadDbFake() {
    // this.userService.getAll().subscribe(users => { 
    //   this.users = users;
    //   this.selectedUser = this.users[0];
    //   console.log('Users: ', this.users);
    // });
  }

}
