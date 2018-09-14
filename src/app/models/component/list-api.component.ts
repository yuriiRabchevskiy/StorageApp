import { MessageService } from 'primeng/components/common/messageservice';
import { OnInit, AfterViewInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { WorkProgress } from './work-progress';
import { ListComponent } from './list.component';
import { ApiResponse } from '../api';


export abstract class ApiListComponentBase<T, TCol> extends ListComponent<TCol> implements OnInit, AfterViewInit {

    work = new WorkProgress(() => this.doGetData(), (res) => this.onDataReceived(res), undefined);
    constructor( notifi: MessageService) {
        super(notifi);
    }

    ngOnInit() { }

    ngAfterViewInit() {
        this.refresh();
    }

    refresh() {
        this.work.startRequest();
    }

    public get showSpinner() {
        return this.work.showSpinner;
    }

    abstract doGetData(): Observable<ApiResponse<T>>;
    abstract onDataReceived(res: ApiResponse<T>): any;

}

export abstract class ApiListComponent<T> extends ApiListComponentBase<T, T> {

    constructor(notifi: MessageService) {
        super(notifi);
    }

    onDataReceived(res: ApiResponse<T>) {
        this.setData(res.items);
    }
}