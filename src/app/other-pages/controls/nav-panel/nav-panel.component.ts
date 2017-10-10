import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'nav-panel',
  templateUrl: './nav-panel.html',
  styleUrls: ['./nav-panel.scss']
})
export class NavPanelComponent {
  activPage: string = '';
  
  menuItems: Array<object> = [
    {
      title: 'Home',
      route: '/home'
    },
    {
      title: 'Stock',
      route: '/storage'
    },
    {
      title: 'Manage',
      route: '/manage'
    }
  ]
  constructor (private router: Router) {
    this.activPage = this.router.url;
  }
  setActive(page) {
    if (this.activPage === page) return;
    this.activPage = page;
  }
}
