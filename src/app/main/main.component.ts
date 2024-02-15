import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { SecuredComponent } from '../models/component/base-api.component';
import { WorkProgress } from '../models/component/work-progress';
import { ApiService } from '../shared/services/api.service';
import { TrackerService } from './../shared/services/tracker.service';
import { UserService } from './../shared/services/user.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent extends SecuredComponent implements OnInit {

  @HostListener('document:visibilitychange', ['$event'])
  handleVisibilityChange(event) {
    if (document.hidden) {
      console.log('doc: hidden');
      // The tab has become inactive.
    } else {
      this.trackerService.connectUser();
      console.log('doc: active');
      // The tab has become active.
      // Perform your extra checks here.
    }
  }

  pages = [];
  page: string = '';
  userLogin: string = 'admin';
  open: boolean = false;

  private _selectedPage: any;
  get selectedPage() { return this._selectedPage; }
  set selectedPage(page: any) {
    this.selectPage(page);
  }

  work: WorkProgress;
  public get showSpinner() {
    return this.work.showSpinner;
  }

  constructor(userService: UserService, notify: MessageService,
    private router: Router, private apiService: ApiService, public trackerService: TrackerService) {
    super(userService, notify);
    const user = this.userService.getLocal();
    if (!user) return;
    this.canView = user.isAdmin;
    this.pages = [
      { title: 'Склад', url: 'storage', view: true },
      { title: 'Мої замовлення', url: 'orders/mine', view: this.isClient },
      { title: 'Продажі', url: 'orders', view: !this.isClient },
      { title: 'Продажі (Архів)', url: 'orders/archive', view: user.isAdmin },
      { title: 'Звіти', url: 'reports', view: user.isAdmin },
      { title: 'Користувачі', url: 'manage', view: user.isAdmin },
      { title: 'Налаштування', url: 'settings', view: true }
    ];
    this.getCurrentUrl(this.router.url);
    this.work = new WorkProgress(() => this.apiService.logout(), (res) => this.onLogoutConfirmed(res), undefined);

    trackerService.connectUser();
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
