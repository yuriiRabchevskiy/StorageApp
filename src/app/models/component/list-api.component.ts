import { PreferenceService } from './../../shared/services/preference.service';
import { MessageService } from 'primeng/api';
import { OnInit, AfterViewInit, Directive } from '@angular/core';
import { Observable } from 'rxjs';
import { WorkProgress } from './work-progress';
import { ListComponent } from './list.component';
import { ApiResponse } from '../api';

export interface ITableColumn {
    title: string;
    field: string;
    width?: number;
    maxWidth?: number;
    hideFilter?: boolean;
    template?: 'date' | 'pageSpecial1' | 'pageSpecial2' | 'pageSpecial3' | undefined;
    format?: string;
    dataClass?: string;
    shouldHideFunc?: () => boolean;
}


@Directive()
export abstract class ApiListComponentBase<T, TCol> extends ListComponent<TCol> implements OnInit, AfterViewInit {

    work = new WorkProgress(() => this.doGetData(), (res) => this.onDataReceived(res), undefined);
    constructor(notifi: MessageService) {
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
    public hiddenColumnsKey: string = 'appWideHiddenColumns';

    public visibleColumn(column: ITableColumn) {
        return !(this.hiddenColumns.has(column.field) || (column.shouldHideFunc && column.shouldHideFunc()));
    }

    public flexBasis(column: ITableColumn) {
        return null;
        if (!column.width) return null;
        return { 'flex-basis': `${column.width}px` };
    }

    constructor(notify: MessageService, protected preferences: PreferenceService) {
        super(notify);
    }

    onDataReceived(res: ApiResponse<T>) {
        this.setData(res.items);
    }

    onColumnsPickerClosed(success: boolean) {
        this.showColumnsPicker = false;
        if (success) {
            const hiddenArray = Array.from(this.hiddenColumns);
            this.preferences.set(this.hiddenColumnsKey, JSON.stringify(hiddenArray));
        }
    }

    initHiddenColumns(key: string) {
        this.hiddenColumnsKey = key;
        const savedJson = this.preferences.get(this.hiddenColumnsKey, '[]');
        const savedArray = JSON.parse(savedJson) as [];
        this.hiddenColumns = new Set<string>(savedArray);
    }

}
