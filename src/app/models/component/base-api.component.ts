import { Directive } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Observable } from 'rxjs';
import { ViewState } from '../../shared/helpers';
import { ApiResponse, IApiErrorInfo, IApiErrorResponse } from '../api';
import { UserService } from './../../shared/services/user.service';
import { WorkProgress } from './work-progress';
import { UserRoleName } from '../manage/user';

export abstract class SecuredComponent {
  public view: ViewState = new ViewState();
  public canView: boolean;
  public canEdit: boolean = false;
  public isAdmin: boolean = false;
  public isAdminAssistant: boolean = false;
  public isClient: boolean = false;
  public isWarehouseManager: boolean = false;

  constructor(public userService: UserService, protected notify: MessageService) {

    const user = this.userService.getLocal();
    if (!user) return;
    this.isAdminAssistant = user.role === UserRoleName.adminAssistant;
    this.isClient = user.role === UserRoleName.client;
    this.isWarehouseManager = user.role === UserRoleName.warehouseManager;
    this.isAdmin = user.isAdmin;
    this.canView = user.isAdmin;
    this.canEdit = user.isAdmin;
  }

  cloneModel<T>(source: T): T {
    if (source === undefined) return <any>{};
    const str = JSON.stringify(source);
    return JSON.parse(str);
  }

  showInfoMessage(message: string) {
    this.notify.add(
      {
        severity: 'info',
        summary: 'Інформація',
        detail: message
      });
  }

  showSuccessMessage(message: string) {
    this.notify.add(
      {
        severity: 'success',
        summary: 'Успіх!',
        detail: message
      });
  }

  showApiErrorMessage(summary: string, res: IApiErrorResponse) {
    const errors = res.errors || [];
    const message = errors.map(it => `${it.field}: ${it.message}\n`).reduce((text, line) => text += line, '');
    this.notify.add(
      {
        severity: 'error',
        summary: summary,
        detail: message
      });
  }
}

@Directive()
export abstract class BaseApiComponent<T> extends SecuredComponent {
  work: WorkProgress;


  public get showSpinner() {
    return this.work.showSpinner;
  }

  constructor(userService: UserService, notify: MessageService) {
    super(userService, notify);
    this.work = new WorkProgress(() => this.doGetData(), (res) => this.onDataReceived(res), undefined);
  }

  ngOnInit() {
    this.getData();
  }

  getData() {
    this.work.startRequest();
  }

  abstract doGetData(): Observable<ApiResponse<T>>;
  abstract onDataReceived(res: ApiResponse<T>): any;
}
