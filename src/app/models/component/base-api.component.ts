import { MessageService } from 'primeng/api';
import { Observable } from 'rxjs';
import { ReflectiveInjector, Directive } from '@angular/core';

import { WorkProgress } from './work-progress';
import { ApiResponse, IApiErrorInfo } from '../api';
import { UserService } from '../../shared/services/user.service';
import { ViewState } from '../../shared/helpers';


export abstract class SecuredComponent {
  public view: ViewState = new ViewState();
  public canView: boolean;
  public canEdit: boolean = false;
  public isAdminAssistant: boolean = false;
  public userService: UserService;

  constructor(protected notifi?: MessageService) {
    const injector = ReflectiveInjector.resolveAndCreate([UserService]);
    this.userService = injector.get(UserService);

    const user = this.userService.getLocal();
    if (!user) return;
    this.isAdminAssistant = user.isAdminAssistant;
    this.canView = user.isAdmin;
    this.canEdit = user.isAdmin;
  }

  cloneModel<T>(source: T): T {
    if (source === undefined) return <any>{};
    const str = JSON.stringify(source);
    return JSON.parse(str);
  }

  showInfoMessage(message: string) {
    this.notifi.add(
      {
        severity: 'info',
        summary: 'Інформація',
        detail: message
      });
  }

  showSuccessMessage(message: string) {
    this.notifi.add(
      {
        severity: 'success',
        summary: 'Успіх!',
        detail: message
      });
  }

  showApiErrorMessage(summary: string, errors: IApiErrorInfo[]) {
    const message = errors.map(it => `${it.field}: ${it.message}\n`).reduce((text, line) => text += line, '');
    this.notifi.add(
      {
        severity: 'error',
        summary: summary,
        detail: message
      });
  }

  showWebErrorMessage(summary: string, error: string) {
    this.notifi.add(
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

  constructor() {
    super();
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
