import { Observable } from 'rxjs/Observable';
import { ReflectiveInjector } from '@angular/core';

import { WorkProgress } from './work-progress';
import { ApiResponse } from '../api';
import { UserService } from '../../shared/services/user.service';
import { ViewState } from '../../shared/helpers';


export abstract class SecuredComponent {
  public view: ViewState = new ViewState();
  canView: boolean;
  canEdit: boolean = false;
  public userService: UserService;

  constructor() {
    let injector = ReflectiveInjector.resolveAndCreate([UserService]);
    this.userService = injector.get(UserService);

    let user = this.userService.getLocal();
    if (!user) return;
    this.canView = user.isAdmin;
  }

  cloneModel<T>(source: T): T {
    if (source === undefined) return <any>{};
    let str = JSON.stringify(source);
    return JSON.parse(str);
  }

}

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
