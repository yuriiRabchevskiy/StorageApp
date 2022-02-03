import { MessageService } from 'primeng/api';
import { SecuredComponent } from './base-api.component';
import { Input, Directive } from '@angular/core';
import { StringFilter, Filter } from '../filtering/filters';
import { UserService } from '@app/shared/services/user.service';

@Directive()
export abstract class ListComponent<TCol> extends SecuredComponent {

    public data: TCol[] = []; // initial data provided to this component.
    public filteredData: TCol[] = []; // data filtered by different filters applied to this component.

    public selectedItem: TCol; // selected Item
    public selectedItems: TCol[] = []; // few selected items if this mode is supported
    public keepSelection: boolean = false;

    public highlight: string;

    // access to basic string filter in case when we need to activate or deactivate it dynamically.
    public strFilter: StringFilter<TCol> = new StringFilter<TCol>();

    public filters: Filter<TCol>[] = [this.strFilter]; // filters which can reduce amount of shown items;

    constructor(userService: UserService, notify: MessageService) {
        super(userService, notify);
    }

    get searchText() {
        return this.strFilter.keyword;
    }

    @Input() set searchText(value: string) {
        this.strFilter.keyword = value;
        this.filter();
    }

    setData(res: TCol[]) {
        let safeRes = res || [];
        this.data = safeRes;
        this.filter();
    }

    getId(item: TCol): string {
        return (<any>item).Id;
    }

    alreadySelected() {
        return (!this.filteredData || this.filteredData.indexOf(this.selectedItem) !== -1);
    }

    removeById(id: string) {
        const item = this.data.find(it => this.getId(it) === id);
        if (!item) return;
        this.remove(item);
    }

    remove(item: TCol) {
        // remove from list
        const index = this.data.indexOf(item);
        if (index > -1) {
            this.data = this.data.filter(it => it !== item);
        }

        let fIndex = this.filteredData.indexOf(item);
        if (fIndex > -1) {
            this.filteredData = this.filteredData.filter(it => it !== item);
        }

        if (this.data === this.filteredData) {
            // there is no filter at all and we work with that same collection. We should use previous index
            fIndex = index;
        }

        // handle when removed is the selected one
        if (item === this.selectedItem)
            this.reselect(fIndex);
    }

    add(item: TCol) {
        this.selectedItem = item;
        this.data.push(item);
        this.data.slice();
        this.filteredData = this.filteredData.map(it => it);
        this.select(item);
    }

    filter() {
        this.filteredData = this.doFilter(this.data);
        this.onFiltered();
        this.reselect();
    }

    doFilter(items: TCol[]): TCol[] {
        if (items && this.filters && this.filters.some(it => it.isActive)) {
            const active = this.filters.filter(it => it.isActive);
            let fData = items;
            for (let i: number = 0; i < active.length; i++) {
                fData = active[i].filter(fData);
            }
            return fData;
        }
        return items;
    }

    reselect(oldIndex: number = undefined) {

        if (this.keepSelection) return;
        if (this.alreadySelected()) return;

        let itemToSelect = undefined
        if (this.filteredData.length > 0) {
            if (!oldIndex || oldIndex < 0) {
                itemToSelect = this.filteredData[0];
            } else if (oldIndex < this.filteredData.length) {
                itemToSelect = this.filteredData[oldIndex]; // try to keep position
            } else {
                // ensure that we can select previous index, or if it was bigger then whole list - last element;
                let mimIndex = Math.min(this.filteredData.length - 1, oldIndex - 1);
                itemToSelect = this.filteredData[mimIndex];
            }
        }
        this.select(itemToSelect);
    }

    selectById(id: string) {
        const item = this.data.find(it => this.getId(it) === id);
        if (!item) return;
        this.select(item);
    }

    select(item: TCol | TCol[], silent: boolean = false) {
        if (!item) { // deselect
            this.selectedItem = undefined;
            this.selectedItems = []
        } else {     // select
            if (item instanceof Array) {
                this.selectedItem = item[0]
                this.selectedItems = item;
            } else {
                this.selectedItem = item;
                this.selectedItems = [item]
            }
        }

        if (!silent)
            this.onSelect(item);
    }

    onRowClick(item) {
        this.select(item);
    }

    onSelect(item: TCol | TCol[]) {
    }

    onFiltered() {

    }

}
