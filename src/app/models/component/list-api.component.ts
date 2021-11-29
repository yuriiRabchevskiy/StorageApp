import {MessageService} from 'primeng/api';
import { OnInit, AfterViewInit, Directive } from '@angular/core';
import { Observable } from 'rxjs';
import { WorkProgress } from './work-progress';
import { ListComponent } from './list.component';
import { ApiResponse } from '../api';

export interface ITableColumn {
    title: string;
    field: string;
    width?: number;
    hideFilter?: boolean;
    shouldHideFunc?: () => boolean;
}


@Directive()
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

@Directive()
export abstract class ApiListComponent<T> extends ApiListComponentBase<T, T> {

    public columns: ITableColumn[] = [];
    public hiddenColumns: Set<string> = new Set<string>();
    public showColumnsPicker: boolean = false;

    public visibleColumn(column: ITableColumn) {
        return !(this.hiddenColumns.has(column.field) || (column.shouldHideFunc && column.shouldHideFunc()));
    }

    constructor(notify: MessageService) {
        super(notify);
    }

    onDataReceived(res: ApiResponse<T>) {
        this.setData(res.items);
    }
}
