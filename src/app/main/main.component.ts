import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Message } from 'primeng/components/common/api';
import { SecuredComponent } from '../models/component/base-api.component';
import { WorkProgress } from '../models/component/work-progress';
import { ApiService } from '../shared/services/api.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent extends SecuredComponent implements OnInit {
  pages = [];
  page: string = '';
  userLogin: string = 'admin';
  open: boolean = false;
  msgs: Message[] = [];

  private _selectedPage: any;
  get selectedPage() {
    return this._selectedPage;
  }
  set selectedPage(page: any) {
    this.selectPage(page);
  }

  work: WorkProgress;
  public get showSpinner() {
    return this.work.showSpinner;
  }

  constructor(private router: Router, private apiService: ApiService) {
    super();
    const user = this.userService.getLocal();
    if (!user) return;
    this.canView = user.isAdmin;
    this.pages = [
      { title: 'Склад', url: 'storage', view: true },
      { title: 'Продажі', url: 'orders', view: true },
      { title: 'Звіти', url: 'reports', view: user.isAdmin },
      { title: 'Користувачі', url: 'manage', view: user.isAdmin },
      { title: 'Налаштування', url: 'settings', view: true }
    ];
    this.getCurrentUrl(this.router.url);
    this.work = new WorkProgress(() => this.apiService.logout(), (res) => this.onLogoutConfirmed(res), undefined);
  }

  ngOnInit() {
    this.getUserFromLocal();
  }

  getUserFromLocal() {
    const user = this.userService.getLocal();
    this.userLogin = user ? user.userName : 'loading...';
  }

  selectPage(page: any) {
    this._selectedPage = page;
    if (!this.view.isMobile) return;
    this.closeMenu();
  }

  onLogoutConfirmed(res) {
    this.userService.clearLocal();
    this.redirectToLogin();
  }

  logout() {
    this.work.startRequest();
  }

  getCurrentUrl(page: string) {
    const url = page.split('/')[1];
    this.selectedPage = url;
  }

  openMenu() {
    this.open = !this.open;
  }
  closeMenu() {
    this.open = false;
  }

  private redirectToLogin() {
    const queryParams = { return: location.hash };
    this.router.navigate(['./login'], { queryParams: queryParams });
  }
}
