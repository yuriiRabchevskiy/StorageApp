import { Directive } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Observable } from 'rxjs';
import { ViewState } from '../../shared/helpers';
import { ApiResponse, IApiErrorInfo } from '../api';
import { UserService } from './../../shared/services/user.service';
import { WorkProgress } from './work-progress';

export abstract class SecuredComponent {
  public view: ViewState = new ViewState();
  public canView: boolean;
  public canEdit: boolean = false;
  public isAdminAssistant: boolean = false;
  public isClient: boolean = false;

  constructor(public userService: UserService, protected notify?: MessageService) {

    const user = this.userService.getLocal();
    if (!user) return;
    this.isAdminAssistant = user.role === 'AdminAssistant';
    this.isClient = user.role === 'Client';
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

  showApiErrorMessage(summary: string, errors: IApiErrorInfo[]) {
    const message = errors.map(it => `${it.field}: ${it.message}\n`).reduce((text, line) => text += line, '');
    this.notify.add(
      {
        severity: 'error',
        summary: summary,
        detail: message
      });
  }

  showWebErrorMessage(summary: string, error: string) {
    this.notify.add(
      {
        severity: 'error',
        summary: summary,
        detail: error
      });
  }

}

@Directive()
export abstract class BaseApiComponent<T> extends SecuredComponent {
  work: WorkProgress;


  public get showSpinner() {
    return this.work.showSpinner;
  }

  constructor(userService: UserService) {
    super(userService);
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
